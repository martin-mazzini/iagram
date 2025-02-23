class UserRepository {
    constructor() {
        this.users = new Map();
    }

    create(user) {
        this.users.set(user.id, user);
        return user;
    }

    findById(id) {
        return this.users.get(id) || null;
    }

    findAll() {
        return Array.from(this.users.values());
    }

    update(user) {
        if (!this.users.has(user.id)) {
            throw new Error('User not found');
        }
        this.users.set(user.id, user);
        return user;
    }

    delete(id) {
        return this.users.delete(id);
    }

    // Helper method to find users by interest
    findByInterest(interest) {
        return Array.from(this.users.values())
            .filter(user => user.interests.includes(interest));
    }
}

module.exports = new UserRepository(); // Export singleton instance 