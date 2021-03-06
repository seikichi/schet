'use strict';

var util = require('util');

var ERRORS = require('../errors');
var mongo = require('./mongo');

const COLLECTION_NAME = 'events';

// Helper Function

var clean = event => {
  delete event.terms.counter;
  delete event.participants.counter;
  delete event.comments.counter;

  return event;
};

var keyOf = (set, item) => {
  for (let key in set) {
    if (!set.hasOwnProperty(key) || key === 'counter') {
      continue;
    }

    if (item === set[key]) {
      return key;
    }
  }
};

// Event

/**
 * Create Event
 * @param {!string} title
 * @param {!string} description
 * @param {!function(Error, Object)} cb
 */
exports.create = function (title, description, cb) {
  const data = {
    title: title,
    description: description,
    terms: {counter: 0},
    participants: {counter: 0},
    record: {},
    comments: {counter: 0}
  };

  return mongo.create(COLLECTION_NAME, data, function (err, event) {
    if (err) {
      return cb(err);
    }

    if (!event) {
      return cb(ERRORS.SERVER_SIDE_ERROR);
    }

    return cb(null, clean(event));
  });
};

/**
 * Get Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb
 */
exports.get = (id, cb) => {
  return mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (!event) {
      return cb(ERRORS.SERVER_SIDE_ERROR);
    }

    return cb(null, clean(event));
  });
};

/**
 * Update, Fix or Unfix Event
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.put = (id, data, cb) => {
  if ('fixed' in data) {
    if ('title' in data || 'description' in data) {
      return cb(ERRORS.INVALID_PARAMETER_ERROR);
    }

    if (data.fixed === '') {
      return exports.unfix(id, cb);
    }

    return exports.fix(id, data.fixed, cb);
  }

  return exports.update(id, data, cb);
};

/**
 * Update  Event
 * @param {!number} id
 * @param {!Object} data
 * @param {!function(Error, Object)} cb
 */
exports.update = (id, data, cb) => {
  return mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    return mongo.set(COLLECTION_NAME, id, data, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Fix Event
 * @param {!number} id
 * @param {!number} termID
 * @param {!function(Error, Object)} cb
 */
exports.fix = (id, termID, cb) => {
  return mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    if (!(termID in event.terms)) {
      return cb(ERRORS.TERM_NOT_FOUND_ERROR);
    }

    return mongo.set(COLLECTION_NAME, id, {fixed: termID}, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Unfix Event
 * @param {!number} id
 * @param {!function(Error, Object)} cb - function(err, event)
 */
exports.unfix = (id, cb) => {
  return mongo.unset(COLLECTION_NAME, id, 'fixed', (err, event) => {
    if (err) {
      return cb(err);
    }

    if (!event) {
      return cb(ERRORS.SERVER_SIDE_ERROR);
    }

    return cb(null, clean(event));
  });
};

/**
 * Delete Event
 * @param {!number} id
 * @param {!function(Error)} cb
 */
exports.delete = (id, cb) => {
  return mongo.delete(COLLECTION_NAME, id, cb);
};

// Term

/**
 * Add Term
 * @param {!number} id
 * @param {!string} term
 * @param {!function(Error, Object)} cb
 */
exports.addTerm = (id, term, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    if (keyOf(event.terms, term)) {
      return cb(ERRORS.DUPLICATED_TERM_ERROR);
    }

    // Modify Terms
    const termID = ++event.terms.counter;
    event.terms[termID] = term;

    // Modify Record
    for (let participantID in event.record) {
      event.record[participantID][termID] = 'absence';
    }

    // Update DB
    const diff = {terms: event.terms, record: event.record};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Update Term
 * @param {!number} id
 * @param {!number} termID
 * @param {!string} term
 * @param {!function(Error, Object)} cb
 */
exports.updateTerm = (id, termID, term, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    if (!(termID in event.terms)) {
      return cb(ERRORS.TERM_NOT_FOUND_ERROR);
    }

    // Duplication Check
    const existingID = keyOf(event.terms, term);
    if (existingID && existingID !== termID) {
      return cb(ERRORS.DUPLICATED_TERM_ERROR);
    }

    // Modify Terms
    event.terms[termID] = term;

    // Update DB
    const diff = {terms: event.terms};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Term
 * @param {!number} id
 * @param {!number} termID
 * @param {!function} cb - function(err, latest)
 */
exports.deleteTerm = (id, termID, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    const outOfRange = termID < 1 || event.terms.counter < termID;
    if (outOfRange) {
      return cb(ERRORS.TERM_NOT_FOUND_ERROR);
    }

    if (!(termID in event.terms)) {
      return cb(null, clean(event));
    }

    // Modify Terms
    delete event.terms[termID];

    // Modify Record
    for (let participantID in event.record) {
      delete event.record[participantID][termID];
    }

    // Update DB
    const diff = {terms: event.terms, record: event.record};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

// Participants

/**
 * Add Participant
 * @param {!number} id
 * @param {!string} name
 * @param {Object.<number, string>} data
 * @param {!function(Error, Object)}cb
 */
exports.addParticipant = (id, name, data, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    if (keyOf(event.participants, name)) {
      return cb(ERRORS.DUPLICATED_PARTICIPANT_ERROR);
    }

    const participantID = ++event.participants.counter;

    // Modify Participants
    event.participants[participantID] = name;

    // Modify Record
    event.record[participantID] = {};
    for (let termID in event.terms) {
      if (termID === 'counter') {
        continue;
      }

      if (!event.record[participantID]) {
        event.record[participantID] = {};
      }

      if (termID in data) {
        event.record[participantID][termID] = data[termID];
      } else {
        event.record[participantID][termID] = 'absence';
      }
    }

    // Update DB
    const diff = {participants: event.participants, record: event.record};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Update Participant
 * @param {!number} id
 * @param {!number} participantID
 * @param {Object.<number, string>} data
 * @param {!function(Error, Object)} cb
 */
exports.updateParticipant = (id, participantID, data, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    const needToModify = (1 <= Object.keys(data).length);
    if (!needToModify) {
      return cb(null, clean(event));
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    if (!(participantID in event.participants)) {
      return cb(ERRORS.PARTICIPANT_NOT_FOUND_ERROR);
    }

    // Duplication Check
    const existingID = keyOf(event.participants, data.name);
    if (existingID && existingID !== participantID) {
      return cb(ERRORS.DUPLICATED_PARTICIPANT_ERROR);
    }

    // Modify Participants
    if ('name' in data) {
      event.participants[participantID] = data.name;
    }

    // Modify Record
    for (let termID in data) {
      if (termID in event.terms) {
        event.record[participantID][termID] = data[termID];
      }
    }

    // Update DB
    const diff = {participants: event.participants, record: event.record};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Participant
 * @param {!number} id
 * @param {!number} participantID
 * @param {!function(Error, Object)} cb
 */
exports.deleteParticipant = (id, participantID, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    if (event.fixed) {
      return cb(ERRORS.FIXED_EVENT_ERROR);
    }

    const outOfRange = participantID < 1 || event.participants.counter < participantID;
    if (outOfRange) {
      return cb(ERRORS.PARTICIPANT_NOT_FOUND_ERROR);
    }

    if (!(participantID in event.participants)) {
      return cb(null, clean(event));
    }

    // Modify Participants
    delete event.participants[participantID];

    // Modify Record
    delete event.record[participantID];

    // Update DB
    const diff = {participants: event.participants, record: event.record};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

// Comment

/**
 * Add Comment
 * @param {!number} id
 * @param {!string} name
 * @param {!string} body
 * @param {!function(Error, Object)} cb
 */
exports.addComment = (id, name, body, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    const commentID = ++event.comments.counter;

    // Modify Comments
    event.comments[commentID] = {
      name: name,
      body: body
    };

    // Update DB
    const diff = {comments: event.comments};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Update Comment
 * @param {!number} id
 * @param {!number} commentID
 * @param {!{name: !string, body: !string}} data
 * @param {!function(Error, Object)} cb
 */
exports.updateComment = (id, commentID, data, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    const needToModify = ('name' in data) || ('body' in data);
    if (!needToModify) {
      return cb(null, clean(event));
    }

    if (!(commentID in event.comments)) {
      return cb(ERRORS.COMMENT_NOT_FOUND_ERROR);
    }

    // Modify Comments
    if ('name' in data) {
      event.comments[commentID].name = data.name;
    }
    if ('body' in data) {
      event.comments[commentID].body = data.body;
    }

    // Update DB
    const diff = {comments: event.comments};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};

/**
 * Delete Comment
 * @param {!number} id
 * @param {!number} commentID
 * @param {!function(Error, Object)} cb
 */
exports.deleteComment = (id, commentID, cb) => {
  mongo.read(COLLECTION_NAME, id, (err, event) => {
    if (err) {
      return cb(err);
    }

    const outOfRange = commentID < 1 || event.comments.counter < commentID;
    if (outOfRange) {
      return cb(ERRORS.COMMENT_NOT_FOUND_ERROR);
    }

    if (!(commentID in event.comments)) {
      return cb(null, clean(event));
    }

    // Modify Comments
    delete event.comments[commentID];

    // Update DB
    const diff = {comments: event.comments};
    return mongo.set(COLLECTION_NAME, id, diff, (err, event) => {
      if (err) {
        return cb(err);
      }

      if (!event) {
        return cb(ERRORS.SERVER_SIDE_ERROR);
      }

      return cb(null, clean(event));
    });
  });
};
