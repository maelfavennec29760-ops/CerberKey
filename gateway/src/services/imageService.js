import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import { randomInt, createHmac, randomBytes } from 'node:crypto'
import { encryptToken, decryptToken } from "./cryptoService.js";
import { encryptionKey, positionKey } from '../config/cryptoKeys.js';
import path from 'node:path'

const IMAGES_DIR = path.resolve('assets/images')
const HEADER_MAGIC = Buffer.from('CBK2')
const HEADER_SIZE = 36
const HEADER_BITS = HEADER_SIZE * 8

//Convertit un UUID en Buffer de 16 octets
const uuidToBuffer = (uuid) => {
    const hex = uuid.replace(/-/g, '')
    if(!/^[0-9a-fA-F]{32}$/.test(hex)) {
        throw new Error("Invalid session UUID")
    }
    return Buffer.from(hex, 'hex')
}
//Convertit un Buffer de 16 octets en UUID
const bufferToUuid = (buffer) => {
    if(buffer.length !== 16) {
        throw new Error("Invalid UUID buffer")
    }
    const hex = buffer.toString('hex')
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
    ].join('-')
}
//Inscription des informations dans les bits de poids faible des premiers canux RGB
const writeHeader = (data, sessionId, nonce) => {
    if(data.length < Math.ceil(HEADER_BITS / 3) * 4) {
        throw new Error("Image too small for CerberKey header")
    }
    const header = Buffer.concat([
        HEADER_MAGIC,
        uuidToBuffer(sessionId),
        nonce
    ])
    if(header.length !== HEADER_SIZE) {
        throw new Error("Invalid CerberKey header size")
    }
    //Chaque octets est réparti sur 8 canaux RGB
    for(let bitIndex = 0; bitIndex < header.length * 8; bitIndex++) {
        const byteIndex = Math.floor(bitIndex / 8)
        const bitOffset = 7 - (bitIndex % 8)
        const bit = (header[byteIndex] >> bitOffset) & 1
        const pixelIndex = Math.floor(bitIndex / 3)
        const channel = bitIndex % 3
        const dataIndex = pixelIndex * 4 + channel
        data[dataIndex] = (data[dataIndex] & 0xFE) | bit
    }
}
//Lecture de l'en-tête
const readHeader = (data) => {
    if(data.length < Math.ceil(HEADER_BITS / 3) * 4) {
        throw new Error("Image too small for CerberKey header")
    }
    const header = Buffer.alloc(HEADER_SIZE)
    for(let bitIndex = 0; bitIndex < HEADER_SIZE * 8; bitIndex++) {
        const pixelIndex = Math.floor(bitIndex / 3)
        const channel = bitIndex % 3
        const dataIndex = pixelIndex * 4 + channel
        const bit = data[dataIndex] & 1
        const byteIndex = Math.floor(bitIndex / 8)
        header[byteIndex] = (header[byteIndex] << 1) | bit
    }
    if(!header.subarray(0, 4).equals(HEADER_MAGIC)) {
        throw new Error("No CerberKey V2 header found")
    }
    return {
        sessionId: bufferToUuid(header.subarray(4, 20)),
        nonce: header.subarray(20, 36)
    }
}
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
const getPosition = (key, nonce, counter, capacity) => {
    const hash = createHmac("sha256", key)
        .update(nonce)
        .update(String(counter))
        .digest();
    return hash.readUInt32BE(0) % capacity;
};

export const embedToken = async (imageBuffer, token, sessionId) => {
    //Décode l'image en données brutes RGBA
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    //Chiffre le token avec la clé AES
    const tokenBuffer = encryptToken(token, encryptionKey);
    //Génère un nonce aléatoire de 16 octets
    const nonce = randomBytes(16);
    //Calcule le cnombre de canaux RGB disponibles
    const capacity = info.width * info.height * 3;
    //Réserve les premiers canaux pour l'en-tête V2
    const availableCapacity = capacity - HEADER_BITS
    //Prépare les données à dissimuler
    const payload = Buffer.alloc(4 + tokenBuffer.length);
    payload.writeUInt32BE(tokenBuffer.length, 0);
    tokenBuffer.copy(payload, 4);
    const requiredBits = payload.length * 8;
    //Vérifie si l'image possède suffisamment de place
    if (availableCapacity <= 0 || requiredBits > availableCapacity) {
        throw new Error("Token too large for image");
    }
    //Inscrit l'identifiant de session et le nonce dans l'image
    writeHeader(data, sessionId, nonce)
    //Empêche l'utilisation plusieurs fois d'une même image
    const usedPositions = new Set();
    let counter = 0
    // Parcourt chaque bit du payload
    for (let bitIndex = 0; bitIndex < requiredBits; bitIndex++) {
        let position;
        // Recherche une position pseudo-aléatoire libre
        do {
            position = getPosition(
                positionKey,
                nonce,
                counter,
                availableCapacity
            ) + HEADER_BITS
            counter++;
        } while (usedPositions.has(position));
        usedPositions.add(position);
        // Détermine le pixel et le canal RGB
        const pixelIndex = Math.floor(position / 3);
        const channel = position % 3;
        const dataIndex = pixelIndex * 4 + channel;
        //Extrait le bits à cacher
        const byteIndex = Math.floor(bitIndex / 8);
        const bitOffset = 7 - (bitIndex % 8);
        const bit = (payload[byteIndex] >> bitOffset) & 1;
        //Modifie uniquement le bit de poids faible
        data[dataIndex] = (data[dataIndex] & 0xFE) | bit;
    }
    //Reconstruit l'image PNG sans perte
    const securedImage = await sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    })
        .png()
        .toBuffer();
    return {
        image: securedImage,
        nonce: nonce.toString("hex")
    };
};


export const extractToken = async (imageBuffer) => {
    // Récupère les pixels RGBA de l'image
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    //Lit l'en-tête CerberKeyV2
    const { sessionId, nonce } = readHeader(data)
    // Nombre de canaux RGB disponibles
    const capacity = info.width * info.height * 3;
    //Exclut les 288 premiers canaux réservés à l'en-tête
    const availableCapacity = capacity - HEADER_BITS
    if(availableCapacity <= 0) {
        throw new Error("Image too small for CerberKey token")
    } 
    // Mémorise les positions déjà lues
    const usedPositions = new Set();
    let counter = 0;
    // Retrouve la prochaine position et lit son dernier bit
    const readBit = () => {
        let position;
        do {
            position = getPosition(
                positionKey,
                nonce,
                counter,
                availableCapacity
            ) + HEADER_BITS
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
    if (tokenLength === 0 || (4 + tokenLength) * 8 > availableCapacity || tokenLength > 4096) {
        throw new Error("Invalid embedded token length");
    }
    // Reconstruit le token
    const tokenBuffer = Buffer.alloc(tokenLength);
    for (let i = 0; i < tokenLength; i++) {
        tokenBuffer[i] = readByte();
    }
    const token = decryptToken(tokenBuffer, encryptionKey)
    return {
        token,
        sessionId
    }
};
