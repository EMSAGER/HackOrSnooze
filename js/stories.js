"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
    //when generating story markup, the application should cehceck to see if a user is signed in first. 
    //call Boolean to check True/FAlse if user is signed in
      //if(signedIn !== false), show stars
  const signedIn = Boolean(currentUser);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
     
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  //console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


async function submitNewStoryForm(e){
  console.debug("submitNewStoryForm", e);
  e.preventDefault(); //prevent a submit form default
            //1.add your constants from the form
  const title = $("#addstory-title").val();
  const author = $("#addstory-author").val();
  const url = $("#addstory-url").val();
  const username = currentUser.username;
  const storyData = {title, url, author, username };

  const story = await storyList.addStory(currentUser, storyData);
  //console.log(storyData);
            //2. call the addStory method
  
  const $story = generateStoryMarkup(story);
  //           //3. put new story on page
  $allStoriesList.prepend($story);
                //4. form isn't clearing - 
  $addStoryForm.trigger("reset");
                //5. need to hide form but in a GRACEFUL manner not abrupt
  $addStoryForm.hide();
}

$addStoryForm.on("submit", submitNewStoryForm)



//allow users to favorite and unfavorite a story


