const Joi = require('joi');

const validationSchemas = {
  // Login validation
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
  }),

  // Update password validation
  updatePassword: Joi.object({
    userId: Joi.number().integer().positive().required().messages({
      'number.base': 'User ID must be a number',
      'any.required': 'User ID is required'
    }),
    oldPassword: Joi.string().min(6).required().messages({
      'string.min': 'Old password must be at least 6 characters long',
      'any.required': 'Old password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
  }),

  // Add facility validation (example for other endpoints)
  addFacility: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Facility name must be at least 2 characters',
      'string.max': 'Facility name cannot exceed 100 characters',
      'any.required': 'Facility name is required'
    }),
    location: Joi.string().min(2).max(200).required(),
    capacity: Joi.number().integer().positive().optional()
  }),

  // Add project activity validation
  addProjectActivity: Joi.object({
    projectId: Joi.number().integer().positive().required(),
    activityName: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).optional()
  }),

  // Add task comment validation
  addTaskComment: Joi.object({
    taskId: Joi.number().integer().positive().required(),
    comment: Joi.string().min(1).max(1000).required(),
    userId: Joi.number().integer().positive().required()
  }),

  // Check unresolved flags validation
  checkUnresolvedFlags: Joi.object({
    project_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be a positive number',
      'any.required': 'Project ID is required'
    }),
    scope_name: Joi.string().min(1).max(100).required().messages({
      'string.base': 'Scope name must be a string',
      'string.min': 'Scope name cannot be empty',
      'string.max': 'Scope name cannot exceed 100 characters',
      'any.required': 'Scope name is required'
    })
  }),

  createCustomTemplate: Joi.object({
    template_name: Joi.string().min(1).max(255).pattern(/^[a-zA-Z0-9\s\-_]+$/).required().messages({
      'string.base': 'Template name must be a string',
      'string.min': 'Template name cannot be empty',
      'string.max': 'Template name cannot exceed 255 characters',
      'string.pattern.base': 'Template name can only contain letters, numbers, spaces, hyphens, and underscores',
      'any.required': 'Template name is required'
    }),
    description: Joi.string().min(1).max(1000).required().messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description cannot be empty',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
    template_payload: Joi.object().min(1).required().messages({
      'object.base': 'Template payload must be an object',
      'object.min': 'Template payload cannot be empty',
      'any.required': 'Template payload is required'
    })
  }),

  createProjectRequest: Joi.object({
      project_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be a positive number',
      'any.required': 'Project ID is required'
      }),
      assignee_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Assignee ID must be a number',
      'number.integer': 'Assignee ID must be an integer',
      'number.positive': 'Assignee ID must be a positive number',
      'any.required': 'Assignee ID is required'
      }),
      request_type: Joi.string().min(1).max(50).required().messages({
      'string.base': 'Request type must be a string',
      'string.min': 'Request type cannot be empty',
      'string.max': 'Request type cannot exceed 50 characters',
      'any.required': 'Request type is required'
      }),
      title: Joi.string().min(1).max(200).required().messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
      }),
      description: Joi.string().max(2000).optional().allow('').messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 2000 characters'
      })
  }),

  createProject: Joi.object({
    facility_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Facility ID must be a number',
    'number.integer': 'Facility ID must be an integer',
    'number.positive': 'Facility ID must be a positive number',
    'any.required': 'Facility ID is required'
    }),
    project_name: Joi.string().min(1).max(200).required().messages({
    'string.base': 'Project name must be a string',
    'string.min': 'Project name cannot be empty',
    'string.max': 'Project name cannot exceed 200 characters',
    'any.required': 'Project name is required'
    }),
    project_description: Joi.string().min(1).max(2000).required().messages({
    'string.base': 'Project description must be a string',
    'string.min': 'Project description cannot be empty',
    'string.max': 'Project description cannot exceed 2000 characters',
    'any.required': 'Project description is required'
    }),
    reporting_period_start: Joi.date().iso().required().messages({
    'date.base': 'Reporting period start must be a valid date',
    'date.format': 'Reporting period start must be in ISO format (YYYY-MM-DD)',
    'any.required': 'Reporting period start is required'
    }),
    reporting_period_end: Joi.date().iso().greater(Joi.ref('reporting_period_start')).required().messages({
    'date.base': 'Reporting period end must be a valid date',
    'date.format': 'Reporting period end must be in ISO format (YYYY-MM-DD)',
    'date.greater': 'Reporting period end must be after the start date',
    'any.required': 'Reporting period end is required'
    }),
    responsible_party: Joi.string().min(1).max(200).required().messages({
    'string.base': 'Responsible party must be a string',
    'string.min': 'Responsible party cannot be empty',
    'string.max': 'Responsible party cannot exceed 200 characters',
    'any.required': 'Responsible party is required'
    }),
    intended_user: Joi.string().min(1).max(200).required().messages({
    'string.base': 'Intended user must be a string',
    'string.min': 'Intended user cannot be empty',
    'string.max': 'Intended user cannot exceed 200 characters',
    'any.required': 'Intended user is required'
    }),
    intended_use_of_inventory: Joi.string().min(1).max(1000).required().messages({
    'string.base': 'Intended use of inventory must be a string',
    'string.min': 'Intended use of inventory cannot be empty',
    'string.max': 'Intended use of inventory cannot exceed 1000 characters',
    'any.required': 'Intended use of inventory is required'
    }),
    organisational_boundary_type: Joi.string().min(1).max(100).required().messages({
    'string.base': 'Organisational boundary type must be a string',
    'string.min': 'Organisational boundary type cannot be empty',
    'string.max': 'Organisational boundary type cannot exceed 100 characters',
    'any.required': 'Organisational boundary type is required'
    }),
    reporting_protocol: Joi.string().min(1).max(100).required().messages({
    'string.base': 'Reporting protocol must be a string',
    'string.min': 'Reporting protocol cannot be empty',
    'string.max': 'Reporting protocol cannot exceed 100 characters',
    'any.required': 'Reporting protocol is required'
    }),
    base_year: Joi.number().integer().min(1900).max(2100).required().messages({
    'number.base': 'Base year must be a number',
    'number.integer': 'Base year must be an integer',
    'number.min': 'Base year must be at least 1900',
    'number.max': 'Base year cannot exceed 2100',
    'any.required': 'Base year is required'
    }),
    team_member_ids: Joi.array().items(
    Joi.number().integer().positive().messages({
        'number.base': 'Team member ID must be a number',
        'number.integer': 'Team member ID must be an integer',
        'number.positive': 'Team member ID must be positive'
    })
    ).optional().messages({
    'array.base': 'Team member IDs must be an array'
    })
  }),
  customizeActiveScopes: Joi.object({
    project_id: Joi.number().integer().positive().required().messages({
      'number.base': 'Project ID must be a number',
      'number.integer': 'Project ID must be an integer',
      'number.positive': 'Project ID must be a positive number',
      'any.required': 'Project ID is required'
    }),
    active_scopes: Joi.array().items(
      Joi.string().min(1).max(100).messages({
        'string.base': 'Scope name must be a string',
        'string.min': 'Scope name cannot be empty',
        'string.max': 'Scope name cannot exceed 100 characters'
      })
    ).min(1).required().messages({
      'array.base': 'Active scopes must be an array',
      'array.min': 'At least one active scope is required',
      'any.required': 'Active scopes are required'
    })
  }),
  getAccessibleFacilities: Joi.object({
    search_term: Joi.string().min(1).max(100).required().messages({
      'string.base': 'Search term must be a string',
      'string.min': 'Search term cannot be empty',
      'string.max': 'Search term cannot exceed 100 characters',
      'any.required': 'Search term is required'
    })
  }),

  getActivitiesForSubcategory: Joi.object({
  main_category_id: Joi.number().integer().positive().required().messages({
    'number.base': 'Main category ID must be a number',
    'number.integer': 'Main category ID must be an integer',
    'number.positive': 'Main category ID must be a positive number',
    'any.required': 'Main category ID is required'
  }),
  subcategory_name: Joi.string().min(1).max(200).required().messages({
    'string.base': 'Subcategory name must be a string',
    'string.min': 'Subcategory name cannot be empty',
    'string.max': 'Subcategory name cannot exceed 200 characters',
    'any.required': 'Subcategory name is required'
  })
}),
getAllRequestsForUser: Joi.object({
  // No parameters needed as we'll use the authenticated user's ID
}),
getAssignableUsers: Joi.object({
  // No parameters needed as we'll use the authenticated user's ID
}),

getDataCollectionSheetForScope: Joi.object({
  project_id: Joi.number().integer().required(),
  scope_name: Joi.string().required(),
  page_size: Joi.number().integer().min(1).default(10),
  page_number: Joi.number().integer().min(1).default(1)
}),

getDataForExport: Joi.object({
  project_id: Joi.number().integer().required(),
  scope_name: Joi.string().required()
}),

getMainCategoriesForScopeAndSource: Joi.object({
  scope: Joi.string().required(),
  source: Joi.string().required()
}),

getPreviewDataForScope: Joi.object({
  project_id: Joi.number().integer().required(),
  scope_name: Joi.string().required()
}),

getRequestThreadDetails: Joi.object({
  task_id: Joi.number().integer().required()
}),

getSelection1ForActivity: Joi.object({
  main_category_id: Joi.number().integer().required(),
  subcategory_name: Joi.string().required(),
  activity_name: Joi.string().required()
}),

getSelection2ForSelection1: Joi.object({
  main_category_id: Joi.number().integer().required(),
  subcategory_name: Joi.string().required(),
  activity_name: Joi.string().required(),
  selection_1_name: Joi.string().required()
}),

getSubcategoriesForMainCategory: Joi.object({
  main_category_id: Joi.number().integer().required()
}),

getTemplateDetailsById: Joi.object({
  template_id: Joi.number().integer().required()
}),

getTemplatesForUser: Joi.object({
  search_term: Joi.string().allow('').optional()
}),

initializeNewProject: Joi.object({
  facility_id: Joi.number().integer().required(),
  project_name: Joi.string().required().max(255),
  project_description: Joi.string().allow('').optional(),
  reporting_period_start: Joi.date().required(),
  reporting_period_end: Joi.date().required().min(Joi.ref('reporting_period_start')),
  responsible_party: Joi.string().required().max(255),
  intended_user: Joi.string().required().max(255),
  intended_use_of_inventory: Joi.string().allow('').optional(),
  organisational_boundary_type: Joi.string().required().valid('Operational Control', 'Financial Control', 'Equity Share'),
  reporting_protocol: Joi.string().required().max(255),
  base_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  industry: Joi.string().required().max(255),
  team_member_ids: Joi.array().items(Joi.number().integer()).optional().default([])
}),

registerUser: Joi.object({
  full_name: Joi.string().required().max(100),
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(8).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
  phone_number: Joi.string().pattern(/^[0-9]{10,15}$/).required()
    .messages({
      'string.pattern.base': 'Phone number must be between 10-15 digits',
      'any.required': 'Phone number is required'
    }),
  org_id: Joi.number().integer().required().messages({
    'number.base': 'Organization ID must be a number',
    'any.required': 'Organization ID is required'
  }),
  facility_id: Joi.number().integer().required().messages({
    'number.base': 'Facility ID must be a number',
    'any.required': 'Facility ID is required'
  }),
  role_id: Joi.number().integer().required().messages({
    'number.base': 'Role ID must be a number',
    'any.required': 'Role ID is required'
  })
}),

resolveAnomalyFlagAsIgnored: Joi.object({
  flag_id: Joi.number().integer().required()
}),



runAllValidationsForScope: Joi.object({
  project_id: Joi.number().integer().required(),
  scope_name: Joi.string().required().valid('Scope 1', 'Scope 2', 'Scope 3') // Adjust valid scopes as needed
}),

upsertActivityDataBatch: Joi.object({
  project_id: Joi.number().integer().required(),
  data_batch: Joi.array().items(
    Joi.object({
      subcategory_id: Joi.number().integer().required(),
      quantity: Joi.number().required().min(0),
      entry_date: Joi.date().required()
    })
  ).required().min(1)
}),

applyTemplateToProject: Joi.object({
  project_id: Joi.number().integer().required(),
  template_id: Joi.number().integer().required()
}),

saveProjectActivityConfiguration: Joi.object({
  project_id: Joi.number().integer().required(),
  configured_activities: Joi.array().items(
    Joi.object({
      subcategory_id: Joi.number().integer().required(),
      frequency: Joi.string().required()
    })
  ).required()
}),

updateExistingCustomTemplate: Joi.object({
  template_id: Joi.number().integer().required(),
  new_name: Joi.string().required(),
  new_description: Joi.string().allow('').required(),
  new_payload: Joi.object().required()
})

};

module.exports = validationSchemas;