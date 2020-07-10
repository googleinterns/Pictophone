package com.google.sps;

public class Email {

 private final User player;
 private String subject;
 private String body;

  public Email(User player) {
    this.player = player;
    subject = "Subject";
    body = "body";
  }

  public void startGame(String gameID) {
    subject = "You have an invitation!";
    body = "Welcome to Pictophone!\n\n" + player.getName() + " has invited you to a game! Join here: http://phoebeliang-step.appspot.com/game/" + gameID;
  }

  public void playerTurn(String gameID) {
    subject = "Your turn to draw!";
    body = "It's time to draw!\n\n Click here to play: http://phoebeliang-step.appspot.com/game/" + gameID;
  }

  public String getBody(){
    return body;
  }

  public String getSubject(){
    return subject;
  }

  public String getEmail(){

    return player.getEmail();
  }
}
