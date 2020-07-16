package com.google.sps;

public class EmailCreation {

 private final User player;
 private final String subject;
 private final String body;
 static String tempSubject;
 static String tempBody;

  public EmailCreation(User player, String subject, String body) {
    this.player = player;
    this.subject = subject;
    this.body = body;
  }

  public static EmailCreation startGameEmail(String gameID, User player) {
    tempSubject = "You have an invitation!";
    tempBody = "Welcome to Pictophone!\n\n" + player.getName() + " has invited you to a game! Join here: http://phoebeliang-step.appspot.com/game/" + gameID;

    return new EmailCreation(player, tempSubject, tempBody);
  }

  public static EmailCreation playerTurnEmail(String gameID, User player) {
    tempSubject = "Your turn to draw!";
    tempBody = "It's time to draw!\n\n Click here to play: http://phoebeliang-step.appspot.com/game/" + gameID;

    return new EmailCreation(player, tempSubject, tempBody);
  }

  public static EmailCreation endGameEmail(String gameID, User player) {
    tempSubject = "The game has ended!";
    tempBody = "Thanks for playing! Find all the images from the game attached below. Come play again sometime:\n\nhttp://phoebeliang-step.appspot.com/game/" + gameID;

    return new EmailCreation(player, tempSubject, tempBody);
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
