import { AES, enc } from 'crypto-js'

export const encryptKey = (length: number, passphrase: string) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let key = ''

    for (let i = 0; i < length; i++) {
        key += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    const encryptedKey = AES.encrypt(key, passphrase).toString()

    return encryptedKey
}

export const decryptKey = (encryptedKey: string, passphrase: string) => {
    const bytes = AES.decrypt(encryptedKey, passphrase)
    const decryptedKey = bytes.toString(enc.Utf8)

    return decryptedKey
}