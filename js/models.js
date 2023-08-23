//contains classes to manage the data of the app and the connection to the API. The name models.js to describe a file containing these kinds of classes that focus on the data and logic about the data. UI stuff shouldn’t go here.

"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "hostname.com";
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

      // Note presence of `static` keyword: this indicates that getStories is
          //  **not** an instance method. Rather, it is a method that is called on the
          //  class directly. Why doesn't it make sense for getStories to be an
          //  instance method? -wan't to change the entire class from the beginning instead of adding a new method to a new instance
                //Instance methods, which act upon individual instances of a class.
                //Static methods, which do not rely on an instance of a class.
          // query the /stories endpoint (no auth required)
  static async getStories() {
    
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance {{= new Story(data_source)} will be used}
   */
  //when adding a new story to the StoryList then story object is adding to the first index of the array the top of the list.
  //array methods to be used to add/remove something from the start of the array: 
  //array.shift()--removes an element from the array (save for later when deleting stories!)
  //array.unshift()--adds a new element to the array

  async addStory(user, {title, author, url}) {
    //per API attributes are the token and story object
    const token = user.loginToken;
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {token, story:{title, author, url}},
    });
          //need to create a new Story instance
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    this.ownStories.unshift(story);

    return story;
  }
//allow user to delete a story
        //to delete a story requirements:
  async removeUserStory(user, storyId){
  const token = user.loginToken;
  await axios({
    url: `${BASE_URL}/stories/${storyId}`,
    method: "DELETE",
    data: {token},
    });
          //filter out like above    
  this.stories = this.stories.filter(s => s.storyId !== storyId); 
  user.ownStories = user.ownStories.filter(s=> s.storyId !== storyId);
  user.favorites = user.favorites.filter(s=> s.storyId !== storyId);

  // isUserStory(story){
  //   return this.ownStories.filter(s=> s.username === story.username);
  // }  
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

      //allow user to favorite a story
  async addFavoriteStory(story){
    this.favorites.push(story);
    await this.addOrRemoveFavorite("add",story);
  }

        //filter will find the favorites to remove selected story 
  async removeFavoriteStory(story){
    this.favorites = this.favorites.filter(s=> s.storyId !== story.storyId);
    await this.addOrRemoveFavorite("remove",story);
  }

  async addOrRemoveFavorite(action, story){
    const token = this.loginToken;
              //if add is true - post, if false, delete
    const Method = action === "add" ? "POST" : "DELETE";
    // console.log(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`);
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: Method,
      data: {token},
      });
  }

  //is this story a favorite of the user? Create a method that shows a user story favorite
      //true|false test of whether an element is true in array & returns the true elements
      // element.some(p1 => p2 === p3)
  isFavorite(story){
    return this.favorites.some(s => s.storyId === story.storyId);
  }

} 








