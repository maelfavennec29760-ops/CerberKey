export const getHealth = (req, res) => {
    res.status(200).json({status: "Ok", message: "CerberKey API is running"})
}