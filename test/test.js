const Immutable = require('immutable');
const assert = require('assert');


function transformErrors(errors, nested) {
  Immutable.fromJS()
  return Immutable.Map(Immutable.fromJS(entriesToObject(Object.entries(errors.toJS()).map(function(entry) {
    if (nested.indexOf(entry[0]) === -1) {
      return [entry[0], concatenateThis(errors.toJS()[entry[0]]).filter(function(elem, index, self) {
        return index == self.indexOf(elem);
      }).join(". ") + "."];
    } else {
      return [entry[0], concatenateThis(errors.toJS()[entry[0]], true)];
    }
  }))));
}
function concatenateThis(error, preserve) {
  if (Array.isArray(error)) {
    if (preserve) {
      if (typeof error[0] === 'string') {
        return error.join(". ") + ".";
      } else {
        return error.map(function(item) {
          return concatenateThis(item, true)
        })
        return arr;
      }
    } else {
      return flatten(error.map(function(item) {
        return concatenateThis(item);
      }));
    }
  } else if (error === Object(error)) {
    if (preserve) {
      if (Object.keys(error).length > 0) {
        return entriesToObject(Object.entries(error).map(function(entry) {
          return [entry[0], concatenateThis(entry[1], true)];
        }));
      } else {
        return error;
      }
    } else {
      return Object.keys(error).map(function(value, index) {
        return concatenateThis(error[value])
      });
    }
  } else if (typeof error === 'string') {
    return error;
  } else {
    return;
  }
}
function flatten(arr) {
  return arr.reduce(function(flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
function entriesToObject(arr) {
  return Object.assign(...arr.map(d => ({[d[0]]: d[1]})));
}


it('should tranform errors', () => {
  // example error object returned from API converted to Immutable.Map
  const errors = Immutable.fromJS({
    name: ['This field is required'],
    age: ['This field is required', 'Only numeric characters are allowed'],
    urls: [{}, {}, {
      site: {
        code: ['This site code is invalid'],
        id: ['Unsupported id'],
      }
    }],
    url: {
      site: {
        code: ['This site code is invalid'],
        id: ['Unsupported id'],
      }
    },
    tags: [{}, {
      non_field_errors: ['Only alphanumeric characters are allowed'],
      another_error: ['Only alphanumeric characters are allowed'],
      third_error: ['Third error']
    }, {}, {
      non_field_errors: [
        'Minumum length of 10 characters is required',
        'Only alphanumeric characters are allowed',
      ],
    }],
    tag: {
      nested: {
        non_field_errors: ['Only alphanumeric characters are allowed'],
      },
    },
  });

  // in this specific case,
  // errors for `url` and `urls` keys should be nested
  // see expected object below
  const result = transformErrors(errors, ['url', 'urls']);

  assert.deepEqual(result.toJS(), {
    name: 'This field is required.',
    age: 'This field is required. Only numeric characters are allowed.',
    urls: [{}, {}, {
      site: {
        code: 'This site code is invalid.',
        id: 'Unsupported id.',
      },
    }],
    url: {
      site: {
        code: 'This site code is invalid.',
        id: 'Unsupported id.',
      },
    },
    tags: 'Only alphanumeric characters are allowed. Third error. ' +
      'Minumum length of 10 characters is required.',
    tag: 'Only alphanumeric characters are allowed.',
  });
});
