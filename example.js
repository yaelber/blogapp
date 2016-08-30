var examplePromise2 = new Promise(function(resolve, reject) {
  // reject('loser'); <- equivalent
  throw new Error('loser');
});
