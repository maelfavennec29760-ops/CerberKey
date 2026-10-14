export const startDemo = async () => {
    const response = await fetch('http://localhost:3000/api/demo/start', {
        method: 'POST'
    });

    console.log('Status:', response.status);
    console.log('URL:', response.url);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
};

export const verifyDemoImage = async (sessionId, file) => {
    //Conversion de l'image en Base64
    const image = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
    })
    //Envoie au backend
    const response = await fetch('http://localhost:3000/api/demo/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sessionId,
            image
        })
    })
    if(!response.ok) {
        throw new Error(`API error: ${response.status}`)
    }
    return response.json()
}

