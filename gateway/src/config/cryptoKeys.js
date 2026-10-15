import { hkdfSync } from 'node:crypto'

//Clé principal stockée dans .env
const masterKeyHex = process.env.CERBERKEY_MASTER_KEY
if(!masterKeyHex || !/^[0-9a-fA-F]{64}$/.test(masterKeyHex)) {
    throw new Error('CERBERKEY_MASTER_KEY must contain 64 hexadecimal characters')
}
const masterKey = Buffer.from(masterKeyHex, 'hex')
//Dérivation de clés indépendantes
const deriveKey = (info) => Buffer.from(
    hkdfSync(
        'sha256',
        masterKey,
        Buffer.alloc(0),
        info,
        32
    )
)
//Clé utilisée pour chiffrer et déchiffrer le token
export const encryptionKey = deriveKey('cerberkey/aes/v1')
//Clé utilisé pour déterminer les positions des bits cachés
export const positionKey = deriveKey('cerberkey/positions/v1')