import prisma from '../config/prisma.js'

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true
            }
        })
        res.status(200).json(users)
    } catch (error) {
        console.error("Prisma Error :", error)
        res.status(500).json({
            message: "Error while fetching users",
        })
    }
}