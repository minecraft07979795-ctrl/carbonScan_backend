const Joi = require("joi");

class Validation { 
  constructor(_utility) {
    this.utility = _utility;
    this.validate = this.validate.bind(this);
  }

  /**
   * Middleware for validating request data
   * @param {Joi.Schema} schema - Joi validation schema
   * @param {string} source - Source of the data to validate ('body', 'query', or 'params')
   */
  validate(schema, source = 'body') {
    return (req, res, next) => {
      // Determine the source of data to validate
      const dataToValidate = 
        source === 'query' ? req.query :
        source === 'params' ? req.params :
        req.body;

      const { error } = schema.validate(dataToValidate, { 
        abortEarly: false,
        allowUnknown: false
      });

      console.log('Validation result:', { error: error ? error.details : null});
      
      
      if (error) {
        return this.utility.response.init(
          res, 
          false, 
          "Validation Failed", 
          {
            errors: error.details.map((err) => err.message),
          }, 
          400
        );
      }

      next();
    };
  }
}

module.exports = (utility) => new Validation(utility);