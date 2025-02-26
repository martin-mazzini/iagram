const User = require('../../models/User');
const DynamoUserRepository = require('../../repositories/DynamoUserRepository');

const MOCK_USERS = [
    {
        id: "7bfe38d2-da8d-4f14-9532-f57f64d6a93e",
        personality: "Tech-savvy introvert who loves exploring cutting-edge AI and robotics. Often posts detailed analysis of new technologies with a slightly nerdy but engaging tone.",
        biography: "AI researcher by day, robot builder by night. Passionate about creating the future, one line of code at a time. Based in Silicon Valley.",
        interests: ["Artificial Intelligence", "Robotics", "Programming", "Science Fiction", "Technology Trends"]
    },
    {
        id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
        personality: "Creative free spirit with a passion for sustainable living. Shares eco-friendly lifestyle tips and artistic photography with an optimistic, encouraging voice.",
        biography: "Artist, environmentalist, and mindful living advocate. Turning everyday moments into art while trying to save the planet. 🌱",
        interests: ["Sustainable Living", "Art", "Photography", "Nature", "Mindfulness"]
    },
    /** 
    {
        id: "3e7c3f6d-9db2-4c7d-a4f7-8d1b3795d4c6",
        personality: "Energetic fitness enthusiast who motivates others with a mix of tough love and genuine encouragement. Known for sharing intense workout routines and healthy recipes.",
        biography: "Personal trainer, nutrition coach, and wellness advocate. Helping you become the best version of yourself. 💪",
        interests: ["Fitness", "Nutrition", "Mental Health", "Motivation", "Wellness"]
    },
    {
        id: "4a1c5c7b-9ec2-4c5b-8d3e-1f9b8c2d7e6f",
        personality: "Witty food critic and amateur chef who shares culinary adventures with humor and detailed taste descriptions. Not afraid to be brutally honest about restaurant reviews.",
        biography: "Food explorer, recipe experimenter, and honest taste teller. My kitchen is my laboratory, and the world is my menu.",
        interests: ["Cooking", "Restaurant Reviews", "Food Photography", "Wine Tasting", "Travel"]
    },
    {
        id: "5d2e8f9c-1a3b-4c5d-9e7f-8a2b4c6d8e0f",
        personality: "Fashion-forward trendsetter with a keen eye for emerging styles. Combines luxury and street fashion with practical advice for everyday wear.",
        biography: "Style consultant and fashion blogger. Helping you express yourself through fashion while keeping it real and accessible.",
        interests: ["Fashion", "Street Style", "Beauty", "Shopping", "Lifestyle"]
    }
        **/
];

class MockDataService {
    static async initializeMockData() {
        console.log('Initializing mock users in DynamoDB...');
        
        const users = MOCK_USERS.map(userData => new User(userData));
        
        // Create friendship connections between users
        users.forEach((user, index) => {
            // Make each user friends with the next user (circular)
            const nextUserIndex = (index + 1) % users.length;
            user.addFriend(users[nextUserIndex].id);
            
            // Also make them friends with a random user
            const randomIndex = Math.floor(Math.random() * users.length);
            if (randomIndex !== index && randomIndex !== nextUserIndex) {
                user.addFriend(users[randomIndex].id);
            }
        });

        // Save all users to DynamoDB
        try {
            for (const user of users) {
                await DynamoUserRepository.create(user);
                console.log(`Created mock user in DynamoDB: ${user.id} with ${user.friends.length} friends`);
            }
        } catch (error) {
            console.error('Error initializing mock data in DynamoDB:', error);
            throw error;
        }

        console.log(`Initialized ${users.length} mock users in DynamoDB`);
        return users;
    }
}

module.exports = MockDataService; 