// Prompts as constants
const PROMPTS = {
    POST: (user, chars) => `Create a realistic Instagram post for a specific based on all the user characteristics. 
    Your goal is to deeply *impersonate* this user — not just simulate an idealized post, but to generate something they would realistically share, based on how they think, feel, and behave. Their tone might be aesthetic or chaotic, emotional or ironic, awkward or eloquent — *whatever fits the actual personality traits*.
    The post should feel like something posted by a *real person*, not a bot or a brand.

Important: Return ONLY valid JSON, no markdown formatting or additional text.

The output should be valid JSON with two keys:
photo: a description of the photo that will accompany the post text content. The description should include all the neccesary details needed for an IA to correctly and accurately generate the Post image without any additional context.
content: the Post text content. Important: the post text content should be ${chars} characters in total, no more no less. 

Important notes:
- Avoid overfitting to hobbies. Interests are background context — they inform the user's world, but don't constrain what they post about. 
- Not all posts should be positive, deep, or aesthetic. Real people post low-effort selfies, messy food pics, awkward group photos, venting, etc.
- Posts can include other — friends, a partner, family (group selfie, a night out, a casual hang with their partner).
- Don't force use of emojis, hashtags, or broken grammar,  *only when appropriate* for the user's tone and post context.
- Again: You don't ALWAYS have to include emojis or hashtags, use with moderation and depending on context.

User profile:
${JSON.stringify(user, null, 2)}`,

    COMMENT: (user, post, chars) => `Generate a realistic, authentic Instagram comment from a user responding to their friend's post.

User characteristics:
Name: ${user.name}
Age: ${user.age}
Gender: ${user.gender}
Personality: ${user.personality}
Interests: ${user.interests.join(', ')}
Biography: ${user.biography}
Socioeconomic status: ${user.socioeconomicStatus}
Political orientation: ${user.politicalOrientation}

Friend's post content:
Post text content: "${post.content}"
Post image description: "${post.photo}"

The comment should:
- Fully impersonate this user. Don't simulate a generic commenter. Instead, deeply internalize the user's personality, age, gender, political orientation, biography, and interests to decide *how they would naturally react* — whether with praise, humor, memes, questions, teasing, flirtation, criticism, or indifference.
- The comment can be any category: positive/praise, humor/memes/, question/curiosity, controversy/criticism, personal/teasing/in-group lingo. 
- Use at most 1–2 emojis *only if* they fit naturally with the user's style and the post's context, don´t overdo it.
- Feel authentic and realistic, as seen on real social media comments.
- The comment should be ${chars} characters long.

Generate only the comment text, no additional explanations.`,

    USER_PROFILE: (chars) => `Generate a possible human character by filling the following fields. 
    Generate a truly random personality. 
    All traits must be randomly and evenly distributed across possibilities (e.g., gender, political views, income level, education). Avoid idealizing or moral filtering.
    The personality can include both positive and negative traits, and should reflect realistic psychological diversity.
    
    Output should be JSON format with the respective keys:
name: The real name.
age:
gender:
personality: A short description of psychology, base yourself on the Big Five.
biography: A short biography of the user. Should include upbringing, studies, work, key life events, pets, family, friends and love life. Include names of relevant people.
socioeconomic_status:
political_orientation:
nationality:
interests:
name:
instagram_username: The instagram username of the user.

Important: Return ONLY valid JSON, no markdown formatting or additional text.
Important: The total count of charachters in your answer should be ${chars} for the whole user profile.
Important: instagram_username must not include the hobbies of the person in the name.`
};

module.exports = PROMPTS; 