
import { Resend } from 'resend'
import JSZip from 'jszip'
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const resend = new Resend(process.env.RESEND_API_KEY)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const sendDemoImages = async (email, securedImage, decoyImage) => {
    // 1. Création de l'archive ZIP
    const zip = new JSZip()

    zip.file('secured.png', securedImage, { base64: true })
    zip.file('decoy.png', decoyImage, { base64: true })

    const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE'
    })

    // 2. Conversion du logo WebP en PNG
    const logoPath = path.resolve(
        __dirname,
        '../../assets/logo/cerberkey.webp'
    )

    const logoBuffer = await sharp(logoPath)
        .resize({ width: 440, withoutEnlargement: true })
        .png()
        .toBuffer()

    // 3. Envoi de l'email avec Resend
    const { data, error } = await resend.emails.send({
        from: 'CerberKey <onboarding@resend.dev>',
        to: email,
        subject: 'CerberKey | Vos images de démonstration',
        html: `
            <div style="background-color:#090b10;padding:40px 15px;font-family:Arial,Helvetica,sans-serif;">
                <div style="max-width:560px;margin:0 auto;background-color:#11151e;border:1px solid #303744;border-radius:12px;padding:35px 25px;color:#ffffff;">

                    <!-- Logo CerberKey -->
                    <div style="text-align:center;margin-bottom:25px;">
                        <img
                            src="cid:cerberkey-logo"
                            alt="CerberKey"
                            width="220"
                            style="display:block;margin:0 auto;max-width:100%;height:auto;"
                        >
                    </div>

                    <hr style="border:0;border-top:1px solid #303744;margin-bottom:30px;">

                    <!-- En-tête -->
                    <p style="text-align:center;color:#ff1738;font-size:12px;letter-spacing:3px;">
                        AUTHENTICATION DEMONSTRATION
                    </p>

                    <h2 style="text-align:center;font-size:24px;color:#ffffff;margin:20px 0;">
                        Vos images sont prêtes.
                    </h2>

                    <p style="color:#b4bdcb;text-align:center;line-height:1.7;font-size:15px;">
                        Votre démonstration CerberKey a été générée avec succès.
                        Retrouvez vos deux images dans l'archive ZIP jointe.
                    </p>

                    <!-- Archive ZIP -->
                    <div style="background-color:#1b202a;border-radius:8px;padding:20px;margin-top:30px;">

                        <p style="color:#ffffff;font-weight:bold;margin-top:0;font-size:16px;">
                            &#128230; cerberkey-demo.zip
                        </p>

                        <hr style="border:0;border-top:1px solid #303744;margin:15px 0;">

                        <p style="color:#b4bdcb;font-size:14px;line-height:2;margin-bottom:0;">
                            &#128274; <strong style="color:#ffffff;">secured.png</strong>
                            — Image contenant le token chiffré
                            <br>
                            &#128444; <strong style="color:#ffffff;">decoy.png</strong>
                            — Image sans token
                        </p>
                    </div>

                    <!-- Durée de validité -->
                    <div style="background-color:#291a22;border-radius:8px;padding:18px;margin-top:20px;">
                        <p style="color:#ff6379;font-size:14px;margin:0;line-height:1.7;">
                            &#9201; <strong>Session temporaire</strong>
                            <br>
                            Votre session de démonstration expire
                            15 minutes après sa création.
                        </p>
                    </div>

                    <!-- Instructions -->
                    <h3 style="color:#ffffff;text-align:center;margin-top:35px;font-size:18px;">
                        Comment tester vos images ?
                    </h3>

                    <p style="color:#b4bdcb;text-align:center;font-size:14px;line-height:1.9;">
                        1. Téléchargez l'archive ZIP en pièce jointe.
                        <br>
                        2. Extrayez les deux images PNG.
                        <br>
                        3. Importez une image dans la démonstration CerberKey.
                        <br>
                        4. Comparez les résultats obtenus.
                    </p>

                    <!-- Pied de page -->
                    <hr style="border:0;border-top:1px solid #303744;margin-top:35px;">

                    <p style="color:#777f8d;text-align:center;font-size:11px;letter-spacing:1px;line-height:1.8;">
                        CERBERKEY
                        <br>
                        SECURE IMAGE AUTHENTICATION
                    </p>

                    <p style="color:#777f8d;text-align:center;font-size:11px;margin-top:20px;">
                        Cet email a été envoyé à la suite d'une demande de démonstration.
                    </p>

                </div>
            </div>
        `,
        attachments: [
            {
                filename: 'cerberkey-demo.zip',
                content: zipBuffer
            },
            {
                filename: 'cerberkey-logo.png',
                content: logoBuffer,
                contentId: 'cerberkey-logo'
            }
        ]
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}
