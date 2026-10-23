
// export const formatValidationError = (errors) => {
//   if(!errors || errors.issues) return 'Validation failed';

//   if(Array.isArray(errors.issues)) return errors.issues.map(i=> i.message).join(', ');

//   return JSON.stringify(errors);
// };


export const formatValidationError = (errors) => {
  if (!errors || !Array.isArray(errors.issues)) {
    return 'Validation failed';
  }

  return errors.issues
    .map(issue => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');
};