"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(e) {
  console.debug("navAllStories", e);
  hidePageComponents();
  putStoriesOnPage();
  $addStoryForm.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(e) {
  console.debug("navLoginClick", e);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When a signed in user clicks on submit nav bar, the add story form will show */
function navStoryClick(e){
  // console.log("submit was clicked");
  console.debug("navStoryClick", e);
  $addStoryForm.show();
}

$navStorySubmit.on("click", navStoryClick);