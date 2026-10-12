// const API_URL = import.meta.VITE_API_URL

// //Demande vers le backend pour créer une session
// export const startDemo = async () => {
//     const response = await fetch(`${API_URL}/api/demo/start`, {
//         method: 'POST'
//     })
//     console.log('Status:', response.status);
//     console.log('URL:', response.url);
//     if(!response) {
//         throw new Error('Failed to start demo')
//     }
//     const text = response.text()
//       console.log('Response length:', text.length);
//     console.log('Response preview:', text.slice(0, 300));
// }
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