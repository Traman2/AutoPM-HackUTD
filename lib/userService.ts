import User, { IUser } from '@/models/User';
import connectDB from '@/lib/mongodb';

interface CreateUserData {
  username: string;
  firstName: string;
  email: string;
  sub: string;
  dateOfBirth?: Date;
}

class UserService {
  /**
   * Find user by Auth0 sub (unique identifier)
   */
  static async findBySub(sub: string): Promise<IUser | null> {
    try {
      await connectDB();
      const user = await User.findOne({ sub });
      return user;
    } catch (error) {
      console.error('Error finding user by sub:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create a new user in the database
   * Only call this if user doesn't exist
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      await connectDB();

      const newUser = new User({
        username: userData.username,
        firstName: userData.firstName,
        email: userData.email.toLowerCase(),
        sub: userData.sub,
        dateOfBirth: userData.dateOfBirth,
      });

      await newUser.save();
      console.log(`✅ New user created: ${userData.email}`);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by sub, or create if doesn't exist
   * This is the main function to use after Auth0 authentication
   */
  static async findOrCreateUser(userData: CreateUserData): Promise<{
    user: IUser;
    isNewUser: boolean;
  }> {
    try {
      await connectDB();

      // First try to find by sub (most reliable identifier)
      let user = await User.findOne({ sub: userData.sub });

      if (user) {
        console.log(`✅ Existing user found: ${user.email}`);
        return { user, isNewUser: false };
      }

      // Check if user exists with same email (edge case: user signed up before)
      user = await User.findOne({ email: userData.email.toLowerCase() });

      if (user) {
        // Update the sub if it changed (unlikely but possible)
        if (user.sub !== userData.sub) {
          user.sub = userData.sub;
          await user.save();
          console.log(`✅ Updated existing user sub: ${user.email}`);
        }
        return { user, isNewUser: false };
      }

      // User doesn't exist, create new user
      user = await this.createUser(userData);
      return { user, isNewUser: true };
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Update user's Reddit authentication tokens
   */
  static async updateRedditAuth(
    sub: string,
    redditAuth: {
      accessToken: string;
      refreshToken: string;
      tokenExpiry: Date;
      scope?: string;
    }
  ): Promise<IUser | null> {
    try {
      await connectDB();

      const user = await User.findOneAndUpdate(
        { sub },
        {
          $set: {
            redditAuth: {
              accessToken: redditAuth.accessToken,
              refreshToken: redditAuth.refreshToken,
              tokenExpiry: redditAuth.tokenExpiry,
              scope: redditAuth.scope || 'read,identity',
            },
          },
        },
        { new: true } // Return updated document
      );

      if (user) {
        console.log(`✅ Updated Reddit auth for user: ${user.email}`);
      }

      return user;
    } catch (error) {
      console.error('Error updating Reddit auth:', error);
      throw error;
    }
  }

  /**
   * Update user's Jira authentication tokens
   */
  static async updateJiraAuth(
    sub: string,
    jiraAuth: {
      cloudSite?: string;
      apiToken?: string;
      userEmail?: string;
      serverUrl?: string;
      personalAccessToken?: string;
      tokenExpiry?: Date;
      scopes?: string[];
    }
  ): Promise<IUser | null> {
    try {
      await connectDB();

      const user = await User.findOneAndUpdate(
        { sub },
        {
          $set: {
            jiraAuth,
          },
        },
        { new: true } // Return updated document
      );

      if (user) {
        console.log(`✅ Updated Jira auth for user: ${user.email}`);
      }

      return user;
    } catch (error) {
      console.error('Error updating Jira auth:', error);
      throw error;
    }
  }

  /**
   * Get user with sensitive fields (tokens) included
   * Use this when you need to access API tokens
   */
  static async getUserWithTokens(sub: string): Promise<IUser | null> {
    try {
      await connectDB();

      const user = await User.findOne({ sub })
        .select('+redditAuth.accessToken +redditAuth.refreshToken +jiraAuth.apiToken +jiraAuth.personalAccessToken');

      return user;
    } catch (error) {
      console.error('Error getting user with tokens:', error);
      throw error;
    }
  }
}

export default UserService;
