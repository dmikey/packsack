/**
 * Pipeliner runs a pipeline of tasks
 */
module.exports = (pipeline, initialValue) => {
  let ret = pipeline[0](initialValue);

  for(let i = 1; i < pipeline.length; i++) {
    ret = pipeline[i](ret);
  }

  return ret;
}