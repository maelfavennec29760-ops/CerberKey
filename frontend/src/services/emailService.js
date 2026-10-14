export const SendDemoEmail = async (email, images) => {
    const response = await fetch('http://localhost:3000/api/email/demo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            securedImage: images.secured,
            decoyImage: images.decoy
        })
    })
    if(!response.ok) {
        throw new Error("Failed to send demo email")
    }
    return response.json()
}