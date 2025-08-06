const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
    console.table(users);
}

async function addAdmin(userId) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' }
        });
        console.log(`Successfully made user ${user.name} (${user.id}) an admin`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function removeAdmin(userId) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' }
        });
        console.log(`Successfully removed admin role from user ${user.name} (${user.id})`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

const command = process.argv[2];
const userId = process.argv[3];

switch (command) {
    case 'add':
        if (!userId) {
            console.error('Please provide a user ID');
            process.exit(1);
        }
        addAdmin(userId).finally(() => prisma.$disconnect());
        break;
    case 'remove':
        if (!userId) {
            console.error('Please provide a user ID');
            process.exit(1);
        }
        removeAdmin(userId).finally(() => prisma.$disconnect());
        break;
    case 'list':
        listUsers().finally(() => prisma.$disconnect());
        break;
    default:
        console.error('Invalid command. Use: add <userId>, remove <userId>, or list');
        process.exit(1);
}
