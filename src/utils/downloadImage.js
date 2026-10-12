import JSZip from 'jszip';

export const downloadImages = async (images) => {
    const zip = new JSZip();
    // Ajoute les deux images PNG dans l'archive
    zip.file('cerberkey-1.png', images.secured, { base64: true });
    zip.file('cerberkey-2.png', images.decoy, { base64: true });
    // Génère l'archive ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    // Crée une URL temporaire
    const url = URL.createObjectURL(blob);
    // Déclenche le téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cerberkey-demo.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Libère les ressources
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};