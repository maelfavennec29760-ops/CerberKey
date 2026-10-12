import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import { randomInt, createHmac, randomBytes } from 'node:crypto'
import { encryptToken, decryptToken } from "./cryptoService.js";
import path from 'node:path'

const IMAGES_DIR = path.resolve('assets/images')

export const generateImage = async () => {
    //Récupère les images JPG 
    const files = await readdir(IMAGES_DIR)
    const images = files.filter(file => 
        /\.(jpg|jpeg)$/i.test(file)
    )
    if(images.length === 0) {
        throw new Error("No images found")
    }
    //Sélectionne une image
    const randomImages = images[randomInt(images.length)]
    const imagePath = path.join(IMAGES_DIR, randomImages)
    //lis les dimension de l'image
    const metadata = await sharp(imagePath).metadata()
    const width = metadata.width
    const height = metadata.height
    //Définis une zone carrée à découper
    const cropSize = Math.floor(Math.min(width, height) * 0.6)
    const left = randomInt(width - cropSize + 1)
    const top = randomInt(height - cropSize + 1)
    //Découpe et redimensionne
    const imageBuffer = await sharp(imagePath)
        .extract({
            left,
            top,
            width: cropSize,
            height: cropSize
        })
        .resize(512, 512)
        .png()
        .toBuffer()
    return imageBuffer
}

// Génère une position pseudo-aléatoire reproductible à partir
// d'une clé secrète, d'un nonce et d'un compteur.
const getPosition = (key, nonce, counter, capacity) => {
    // HMAC-SHA256 génère une empreinte à partir de la clé secrète.
    // Pour les mêmes paramètres, le résultat sera toujours identique.
    const hash = createHmac("sha256", key)
        .update(nonce)
        .update(String(counter))
        .digest();
    // Convertit les 4 premiers octets du hash en entier.
    // Le modulo limite la position au nombre de canaux RGB disponibles.
    return hash.readUInt32BE(0) % capacity;
};

export const embedToken = async (imageBuffer, token, secretKey) => {
    // Décode l'image en données brutes RGBA.
    // Chaque pixel possède 4 canaux : rouge, vert, bleu et alpha.
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    // Convertit le token en octets pour pouvoir manipuler ses bits.
    const tokenBuffer = encryptToken(token, secretKey);
    // Génère un nonce aléatoire de 16 octets.
    // Il permet de produire des positions différentes à chaque insertion,
    // même si la clé secrète reste identique.
    const nonce = randomBytes(16);
    // Prépare les données à cacher :
    // 4 octets pour la longueur du token, suivis du token lui-même.
    const payload = Buffer.alloc(4 + tokenBuffer.length);
    // Écrit la longueur du token dans les 4 premiers octets.
    payload.writeUInt32BE(tokenBuffer.length, 0);
    // Copie les octets du token après sa longueur.
    tokenBuffer.copy(payload, 4);
    // Chaque pixel peut stocker 3 bits :
    // un dans le canal rouge, un dans le vert et un dans le bleu.
    const capacity = info.width * info.height * 3;
    // Calcule le nombre total de bits à cacher.
    const requiredBits = payload.length * 8;
    // Vérifie que l'image possède suffisamment de canaux disponibles.
    if (requiredBits > capacity) {
        throw new Error("Token too large for image");
    }
    // Mémorise les positions déjà utilisées pour éviter
    // d'écraser un bit précédemment inséré.
    const usedPositions = new Set();
    let counter = 0
    // Parcourt tous les bits des données à cacher.
    for (let bitIndex = 0; bitIndex < requiredBits; bitIndex++) {
        let position;
        // Recherche une position pseudo-aléatoire non encore utilisée.
        do {
            position = getPosition(
                secretKey,
                nonce,
                counter,
                capacity
            );
            counter++;
        } while (usedPositions.has(position));
        // Enregistre la position pour empêcher sa réutilisation.
        usedPositions.add(position);
        // Détermine le pixel et le canal RGB correspondant à la position.
        const pixelIndex = Math.floor(position / 3);
        const channel = position % 3;
        // Chaque pixel contient 4 octets RGBA.
        // On ignore le canal alpha pour préserver la transparence.
        const dataIndex = pixelIndex * 4 + channel;
        // Identifie l'octet contenant le bit à insérer.
        const byteIndex = Math.floor(bitIndex / 8);
        // Détermine la position du bit dans cet octet,
        // en commençant par le bit de poids fort.
        const bitOffset = 7 - (bitIndex % 8);
        // Extrait le bit (0 ou 1) des données.
        const bit = (payload[byteIndex] >> bitOffset) & 1;
        // Stéganographie LSB :
        // 0xFE efface le dernier bit du canal de couleur.
        // L'opérateur | remplace ce bit par celui du token.
        // La couleur varie au maximum de 1 sur 255.
        data[dataIndex] = (data[dataIndex] & 0xFE) | bit;
    }
    // Reconstruit une image PNG à partir des pixels modifiés.
    // Le PNG est sans perte, contrairement au JPEG qui pourrait
    // détruire les bits contenant les données cachées.
    const securedImage = await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    })
        .png()
        .toBuffer();
    // Retourne l'image sécurisée et le nonce.
    // Le nonce devra être conservé pour retrouver les mêmes positions
    // lors de l'extraction du token.
    return {
        image: securedImage,
        nonce: nonce.toString("hex")
    };
};


export const extractToken = async (imageBuffer, secretKey, nonceHex) => {
    // Récupère les pixels RGBA de l'image
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    // Convertit le nonce en octets
    const nonce = Buffer.from(nonceHex, "hex");
    // Nombre de canaux RGB disponibles
    const capacity = info.width * info.height * 3;
    // Mémorise les positions déjà lues
    const usedPositions = new Set();
    let counter = 0;
    // Retrouve la prochaine position et lit son dernier bit
    const readBit = () => {
        let position;
        do {
            position = getPosition(
                secretKey,
                nonce,
                counter,
                capacity
            );
            counter++;
        } while (usedPositions.has(position));
        usedPositions.add(position);
        // Retrouve le pixel et son canal RGB
        const pixelIndex = Math.floor(position / 3);
        const channel = position % 3;
        const dataIndex = pixelIndex * 4 + channel;
        // Récupère le bit de poids faible
        return data[dataIndex] & 1;
    };
    // Reconstruit un octet à partir de 8 bits
    const readByte = () => {
        let byte = 0;
        for (let i = 0; i < 8; i++) {
            byte = (byte << 1) | readBit();
        }
        return byte;
    };
    // Lit les 4 octets contenant la longueur du token
    const lengthBuffer = Buffer.alloc(4);
    for (let i = 0; i < 4; i++) {
        lengthBuffer[i] = readByte();
    }
    const tokenLength = lengthBuffer.readUInt32BE(0);
    // Vérifie que la longueur est cohérente
    if (tokenLength === 0 || (4 + tokenLength) * 8 > capacity) {
        throw new Error("Invalid embedded token length");
    }
    // Reconstruit le token
    const tokenBuffer = Buffer.alloc(tokenLength);
    for (let i = 0; i < tokenLength; i++) {
        tokenBuffer[i] = readByte();
    }
    return decryptToken(tokenBuffer, secretKey);
};
