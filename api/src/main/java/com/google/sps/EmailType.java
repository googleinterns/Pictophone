package com.google.sps;

import com.google.api.gax.rpc.InvalidArgumentException;

enum EmailType {
  START, TURN;

  public EmailCreation createEmail(String gameID, String playerEmail, String playerName)
    throws InvalidArgumentException {

    if(EmailType.this == START) {
      return EmailCreation.startGameEmail(gameID, new User(playerEmail, playerName));
    } else if(EmailType.this == TURN) {
      return EmailCreation.endGameEmail(gameID, new User(playerEmail, playerName));
    }

    throw new IllegalArgumentException();
  }
}
