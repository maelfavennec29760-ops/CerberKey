export const sendFeedback = async (name, comment) => {
    const response = await fetch('/api/demo/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            comment
        })
    })
    const data = await response.json()
    if(!response.ok) {
        throw new Error(data.message || "Impossible d'envoyer votre avis.")
    }
    return data
}