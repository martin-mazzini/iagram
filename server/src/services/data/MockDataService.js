const User = require('../../models/User');
const UserRepository = require('../../repositories/UserRepository');

const MOCK_USERS = [
    {
        personality: "Tech-savvy introvert who loves exploring cutting-edge AI and robotics. Often posts detailed analysis of new technologies with a slightly nerdy but engaging tone.",
        biography: "AI researcher by day, robot builder by night. Passionate about creating the future, one line of code at a time. Based in Silicon Valley.",
        interests: ["Artificial Intelligence", "Robotics", "Programming", "Science Fiction", "Technology Trends"]
    },
    {
        personality: "Creative free spirit with a passion for sustainable living. Shares eco-friendly lifestyle tips and artistic photography with an optimistic, encouraging voice.",
        biography: "Artist, environmentalist, and mindful living advocate. Turning everyday moments into art while trying to save the planet. 🌱",
        interests: ["Sustainable Living", "Art", "Photography", "Nature", "Mindfulness"]
    },
    {
        personality: "Energetic fitness enthusiast who motivates others with a mix of tough love and genuine encouragement. Known for sharing intense workout routines and healthy recipes.",
        biography: "Personal trainer, nutrition coach, and wellness advocate. Helping you become the best version of yourself. 💪",
        interests: ["Fitness", "Nutrition", "Mental Health", "Motivation", "Wellness"]
    },
    {
        personality: "Witty food critic and amateur chef who shares culinary adventures with humor and detailed taste descriptions. Not afraid to be brutally honest about restaurant reviews.",
        biography: "Food explorer, recipe experimenter, and honest taste teller. My kitchen is my laboratory, and the world is my menu.",
        interests: ["Cooking", "Restaurant Reviews", "Food Photography", "Wine Tasting", "Travel"]
    },
    {
        personality: "Fashion-forward trendsetter with a keen eye for emerging styles. Combines luxury and street fashion with practical advice for everyday wear.",
        biography: "Style consultant and fashion blogger. Helping you express yourself through fashion while keeping it real and accessible.",
        interests: ["Fashion", "Street Style", "Beauty", "Shopping", "Lifestyle"]
    }
];

class MockDataService {
    static initializeMockData() {
        console.log('Initializing mock users...');
        
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

        // Save all users to repository
        users.forEach(user => {
            UserRepository.create(user);
            console.log(`Created mock user: ${user.id} with ${user.friends.length} friends`);
        });

        console.log(`Initialized ${users.length} mock users`);
        return users;
    }
}

module.exports = MockDataService; 