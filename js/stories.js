///this sheet User interface code for stories


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

function generateStoryMarkup(story, showTrash = false) {
  // console.debug("generateStoryMarkup", story);
    //when generating story markup, the application should cehceck to see if a user is signed in first. 
    //call Boolean to check True/FAlse if user is signed in
      //if(signedIn !== false), show stars
  
  const showStar = Boolean(currentUser);
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${showTrash ? showTrashCans() : ''}
        ${showStar ? putStarsOnPageHTML(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
// ${showStar ? putStarsOnPageHTML(story, user) : ""}
//       

/** Gets list of stories from server, generates their HTML, and puts on page. */
/**HTML MARKUP FOR BASURA */
function showTrashCans(){
  return `<span class = "trash">
            <i class = "fas fa-trash-alt">
            </i></span>`;
}
/**HTML markup for Stars*/
function putStarsOnPageHTML(story, user){
  const isFavorite = user.isFavorite(story);
  const star = isFavorite? "fas" : "far";
  return `<span class = "star">
          <i class = "${star} fa-star"></i></span>`;
}

//puts the stories on the pages
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

//user can edit a story
// async function editStory(e){
//   console.debug("editStory", e);
//   const storyId = $(e.target).closest("li").attr("id");
//   await storyList.editStory(storyId);
//   putStoriesOnPage();
// }

//user deletes a story

async function deleteStory(e){
  console.debug("deleteStory");
  const storyId = $(e.target).closest("li").attr("id");
  await storyList.removeStory(currentUser, storyId);
  putStoriesOnPage();
}

$myStoriesList.on("click", deleteStory);

//user submits a new story
async function submitNewStoryForm(e){
  console.debug("submitNewStoryForm");
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
  $addStoryForm.slideUp("slow");
  $addStoryForm.trigger("reset");
                //5. need to hide form but in a GRACEFUL manner not abrupt
  
}
$addStoryForm.on("submit", submitNewStoryForm);

/******************************************************************************
 * now we need to add the user's submitted stories onto the mystories page
 *
 */
function putUsersStoriesOnPage(){
  console.debug("putUsersStoriesOnPage");

  $myStoriesList.empty();

  if(currentUser.ownStories.length === 0){
    $myStoriesList.append("<h4>No stories submitted</h4>");
  }
  else{
    for (let story of currentUser.ownStories){
      const $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story);
    }
  }
  $myStoriesList.show();
}


//Functions of handling favorites
        //1.Handling the favorite page list section
        //2. clicking/unclicking (favorite/removing favorite )starts

  //step 1: create a favorites page where the favorite list is displayed when (logged in & favorite)

function putFavoriteOnListPage(){
  console.debug("putFavoriteOnListPage");

  $favoriteStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  if(currentUser.favorites.length === 0){
    $favoriteStoriesList.append("<h4>No Favorites Added</h4>");
  }  
  else{
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
  }
  $favoriteStoriesList.show();
}

  //step 2: switching from favorite to unfavorite via TOGGLING 
  //things to consider: what will be the e.target? how will the star be chosen if its buried in code? where is it buried? is the location of burial the best place to click?
    //async because: we are waiting for other data
  async function toggleFavoriteStar(e){
    const $target = $(e.target);
    //console.log($target);
    const $targetLI = $target.closest("li");
    //console.log($targetLI);
    const $storyId = $targetLI.attr("id");
    //console.log($storyId);
    const story = storyList.stories.find(s => s.storyId === $storyId);
    //console.log(story);
          //before you can toggle the class, we need to add/remove the story
                  //problem 1: stars keep removing themselves from the list--wrong method used

                  //problem 2: friendList is not removing the toggled/unfavorited stories
    if($target.hasClass("fas")){
      await currentUser.removeFavoriteStory(story);
      //console.log($target);
      $target.closest("i").toggleClass("fas far");
      //$favoriteStoriesList.remove(story);
      //console.log($target);
  }
    else{
      await currentUser.addFavoriteStory(story);
      $target.closest("i").toggleClass("fas far");
  }
}

// $allStoriesList.on("click", toggleFavoriteStar);
// $favoriteStoriesList.on("click", toggleFavoriteStar);
$allThreeStories.on("click", toggleFavoriteStar);