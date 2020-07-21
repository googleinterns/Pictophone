package com.google.sps;

import com.google.api.gax.rpc.InvalidArgumentException;

enum EmailType {
  START, TURN, END;

  public Email createEmail(String gameID, String playerEmail, String playerName)
    throws IllegalArgumentException {

    if(EmailType.this == START) {
      return Email.startGameEmail(gameID, new User(playerEmail, playerName));
    } else if(EmailType.this == END) {
      return Email.endGameEmail(gameID, new User(playerEmail, playerName));
    }

    throw new IllegalArgumentException();
  }
}
