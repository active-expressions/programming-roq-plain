define(function module(require) { "use strict"

  var errorIfFalse = function(check) {
    if(!check) {
      throw new Error('OH NO!');
    }
  };

  var withLogging = require('./src/withlogging');
  var select = require('./src/select');

  var AddExpr = require('./src/expr').AddExpr;
  var NegExpr = require('./src/expr').NegExpr;
  var NumExpr = require('./src/expr').NumExpr;

  withLogging.call(AddExpr);

  var seventeen = new NumExpr(17);
  var adExpr = new AddExpr(
    new NegExpr(
      seventeen
    ),
    new NumExpr(42)
  )

  var threshold = 10;
  var selection = select(AddExpr, function(expr) {
    return expr.result() > threshold;
  });

  errorIfFalse(selection.size() === 1);

  var manualSelectionSize = 0;
  selection
    .enter(function(item) {
      manualSelectionSize++;
    })
    .exit(function(item) {
      manualSelectionSize--;
    });

  errorIfFalse(manualSelectionSize === 1);

  var mappedSelection = selection.map(function(addExpr) {
    return new NumExpr(addExpr.result());
  })
    .enter(function(numExpr) {
      console.log('new NumExpr through maping', numExpr);
    });


  errorIfFalse(mappedSelection.size() === 1);
  mappedSelection.now().forEach(function(numExpr) {
    errorIfFalse(numExpr.result() === 25);
  });

  var five = new NumExpr(5);
  var expr = new AddExpr(
    five,
    adExpr
  );
  errorIfFalse(expr.result() === 30);
  errorIfFalse(selection.size() === 2);
  errorIfFalse(manualSelectionSize === 2);

  errorIfFalse(mappedSelection.size() === 2);
  mappedSelection.now().forEach(function(numExpr) {
    errorIfFalse(
      numExpr.result() === 25 ||
      numExpr.result() === 30
    );
  });

  five.val = -30;
  errorIfFalse(expr.result() === -5);
  errorIfFalse(selection.size() === 1);
  errorIfFalse(manualSelectionSize === 1);

  errorIfFalse(mappedSelection.size() === 1);
  mappedSelection.now().forEach(function(numExpr) {
    errorIfFalse(numExpr.result() === 25);
  });

  seventeen.val = 70;
  errorIfFalse(expr.result() === -58);
  errorIfFalse(selection.size() === 0);
  errorIfFalse(manualSelectionSize === 0);

  errorIfFalse(mappedSelection.size() === 0);

  var eleven = new NegExpr(
    new NegExpr(
      new NumExpr(11)
    )
  );
  var expr2 = new AddExpr(
    eleven,
    new NumExpr(0)
  );
  errorIfFalse(expr2.result() === 11);
  errorIfFalse(selection.size() === 1);
  errorIfFalse(manualSelectionSize === 1);

  errorIfFalse(mappedSelection.size() === 1);
  mappedSelection.now().forEach(function(numExpr) {
    errorIfFalse(numExpr.result() === 11);
  });

  var newFive = new NumExpr(5)
  eleven.expr = newFive;
  errorIfFalse(expr2.result() === -5);
  errorIfFalse(selection.size() === 0);
  errorIfFalse(manualSelectionSize === 0);

  errorIfFalse(mappedSelection.size() === 0);

  newFive.val = -11;
  console.log('Size of Selection', selection.size());
  errorIfFalse(expr2.result() === 11);
  errorIfFalse(selection.size() === 1);
  errorIfFalse(manualSelectionSize === 1);

  errorIfFalse(mappedSelection.size() === 1);
  mappedSelection.now().forEach(function(numExpr) {
    errorIfFalse(numExpr.result() === 11);
  });

  expr2.destroy();
  expr2.destroy();
  console.log('Size of Selection', selection.size());
  errorIfFalse(selection.size() === 0);
  errorIfFalse(manualSelectionSize === 0);

  errorIfFalse(mappedSelection.size() === 0);
});
