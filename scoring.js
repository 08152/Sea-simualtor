window.FS = window.FS || {};
FS.Scoring = {
  catchPoints(phase){return phase==="blue"?10:phase==="green"?5:0;},
  starsFromAccuracy(accuracy){
    return accuracy>.92?5:accuracy>.80?4:accuracy>.66?3:accuracy>.5?2:1;
  },
  valueAfterProcessing(base,stars){return base+Math.round(base*(stars/10));}
};
