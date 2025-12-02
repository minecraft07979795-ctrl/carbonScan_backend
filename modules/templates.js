const cloudinary = require("../config/cloudinary.js");

class Templates {
  constructor(_utility) {
    this.utility = _utility;
  }

  CreateCustomTemplate = async (req, res) => {
    try {
      const { template_name, description, template_payload } = req.body;
      const creator_user_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_custom_template_from_scratch($1, $2, $3, $4)',
        values: [creator_user_id, template_name, description, JSON.stringify(template_payload)]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_template_id, status_message } = result.rows[0];

      if (new_template_id) {
        return this.utility.response.init(res, true, status_message, {
          template_id: new_template_id,
          template_name,
          description
        }, 201);
      } else {
        // Handle database errors (duplicate name, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "TEMPLATE_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating custom template:', error);
      return this.utility.response.init(res, false, "Internal server error while creating template", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };


  create_custom_temp_template_from_scratch = async (req, res) => {
    try {
      const { template_name, description, template_payload } = req.body;
      const creator_user_id = req.user.userId; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_custom_temp_template_from_scratch($1, $2, $3, $4)',
        values: [creator_user_id, template_name, description, JSON.stringify(template_payload)]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_template_id, status_message } = result.rows[0];

      if (new_template_id) {
        return this.utility.response.init(res, true, status_message, {
          template_id: new_template_id,
          template_name,
          description
        }, 201);
      } else {
        // Handle database errors (duplicate name, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "TEMPLATE_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating custom template:', error);
      return this.utility.response.init(res, false, "Internal server error while creating template", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };












  GetTemplateDetailsById = async (req, res) => {
    try {
      const { template_id } = req.query;

      const query = {
        text: 'SELECT get_template_details_by_id($1) as template_data',
        values: [template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "Template not found", {
          error: "TEMPLATE_NOT_FOUND"
        }, 404);
      }

      const templateData = result.rows[0].template_data;

      if (!templateData) {
        return this.utility.response.init(res, false, "Template data is empty", {
          error: "EMPTY_TEMPLATE"
        }, 404);
      }

      return this.utility.response.init(
        res,
        true,
        "Template details retrieved successfully",
        {
          template: templateData
        }
      );

    } catch (error) {
      console.error('Error fetching template details:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching template details",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  GetTemplatesForUser = async (req, res) => {
    try {

      // const { search_term } = req.query;
      // const user_id = req.user.userId; // From JWT token

      const { org_id, industry } = req.body

      const query = {
        text: 'SELECT * FROM get_templates_for_user($1, $2)',
        // values: [user_id, search_term || null]
        values: [org_id, industry || null]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  UpdateExistingCustomTemplate = async (req, res) => {
    try {
      const { template_id, new_name, new_description, new_payload } = req.body;
      const user_id = req.user.userId; // from JWT

      const query = {
        text: 'SELECT public.update_existing_custom_template($1, $2, $3, $4, $5::jsonb) AS message',
        values: [user_id, template_id, new_name, new_description, JSON.stringify(new_payload)]
      };

      const result = await this.utility.sql.query(query);
      const message = result.rows?.[0]?.message || 'No response from database';
      const success = message.toLowerCase().includes('successfully');

      return this.utility.response.init(res, success, message, { message });
    } catch (error) {
      console.error('Error updating template:', error);
      return this.utility.response.init(res, false, 'Failed to update template', { error: error.message }, 500);
    }
  };





  apply_template_to_project = async (req, res) => {
    try {

      const { p_project_id, p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM apply_template_to_project($1, $2)',
        values: [p_project_id, p_template_id || null]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  get_template_details_by_id = async (req, res) => {
    try {

      const { p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM get_template_details_by_id($1)',
        values: [p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  //does not exist
  get_main_categories_for_scope_and_source = async (req, res) => {
    try {

      const { p_template_id } = req.body

      const query = {
        text: 'SELECT * FROM  get_main_categories_for_scope_and_source($1)',
        values: [p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_subcategories_for_main_category = async (req, res) => {
    try {
      const { p_main_category_id } = req.body;

      const query = {
        text: 'SELECT * FROM get_subcategories_for_main_category($1)',
        values: [p_main_category_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_activities_for_subcategory = async (req, res) => {
    try {

      const { p_main_category, p_subcategory_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_activities_for_subcategory($1,$2)',
        values: [p_main_category, p_subcategory_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_selection1_for_activity = async (req, res) => {
    try {

      const { p_main_category, p_subcategory_name, p_activity_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_selection1_for_activity($1,$2,$3)',
        values: [p_main_category, p_subcategory_name, p_activity_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_selection2_for_selection1 = async (req, res) => {
    try {

      const { p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_selection2_for_selection1($1,$2,$3,$4)',
        values: [p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_emission_factor_for_selection = async (req, res) => {
    try {

      const { p_source, p_scope, p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name, p_selection_2_name } = req.body

      const query = {
        text: 'SELECT * FROM  get_emission_factor_for_selection($1,$2,$3,$4,$5,$6,$7)',
        values: [p_source, p_scope, p_main_category_id, p_subcategory_name, p_activity_name, p_selection_1_name, p_selection_2_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  get_template_usage_percentage = async (req, res) => {
    try {

      const { p_template_id, p_parent_org_id, p_industry } = req.body

      const query = {
        text: 'SELECT * FROM  get_template_usage_percentage($1,$2,$3)',
        values: [p_template_id, p_parent_org_id, p_industry]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Templates retrieved successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  save_project_activity_configuration = async (req, res) => {
    try {

      const { p_project_id, p_configured_activities } = req.body

      const query = {
        text: 'SELECT * FROM  save_project_activity_configuration($1,$2)',
        values: [p_project_id, p_configured_activities]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "save_project_activity_configuration  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  // _______________________________________________________________________________

  copy_template_to_staging_area = async (req, res) => {
    try {
      const { p_project_id, p_template_id } = req.body
      const query = {
        text: 'SELECT * FROM  copy_template_to_staging_area($1,$2)',
        values: [p_project_id, p_template_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template data copied to stage area successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_staged_activities_for_project = async (req, res) => {
    try {

      const { p_project_id, p_scope } = req.body

      const query = {
        text: 'SELECT * FROM  get_staged_activities_for_project($1,$2)',
        values: [p_project_id, p_scope]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }
          // Check if no records returned
    if (result.rows.length === 0) {
      return this.utility.response.init(
        res,
        false,
        "No staged template data available",
        {
          templates: [],
          count: 0
        },
        200
      );
    }

      return this.utility.response.init(
        res,
        true,
        "Getting Staged Template Data successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  // append_staged_activity_by_id = async (req, res) => {
  //   try {
      
  //     const { p_project_id, p_subcategory_id, p_frequency } = req.body;


  //     const query = {
  //       text: 'SELECT * FROM append_staged_activity_by_id($1,$2,$3)',
  //       values: [p_project_id, p_subcategory_id, p_frequency]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows || result.rows.length === 0) {
  //       return this.utility.response.init(res, false, "append_staged_activity_by_id not found", {
  //         error: "append_staged_activity_by_id_NOT_FOUND"
  //       }, 404);
  //     }

  //     console.log("first->>",result);

  //     const templateData = result.rows[0].template_data;

  //     if (!templateData) {
  //       return this.utility.response.init(res, false, "Template data is empty", {
  //         error: "EMPTY_TEMPLATE"
  //       }, 404);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "Data Added on Staged Template Area successfully",
  //       {
  //         template: templateData
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching template details:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching template details",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



  append_staged_activity_by_id = async (req, res) => {
  try {
    const { p_project_id, p_subcategory_id, p_frequency } = req.body;

    const query = {
      text: 'SELECT * FROM append_staged_activity_by_id($1,$2,$3)',
      values: [p_project_id, p_subcategory_id, p_frequency]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(
        res,
        false,
        "No response from database",
        { error: "DB_EMPTY" },
        500
      );
    }

    const dbResponse = result.rows[0].append_staged_activity_by_id;
    const msg = dbResponse?.toString() || "Unknown DB response";

    // Identify if DB returned "Error:"
    if (msg.toLowerCase().startsWith("error")) {
      return this.utility.response.init(
        res,
        false,
        msg,
        { rawMessage: msg },
        400
      );
    }

    // Otherwise treat as success
    return this.utility.response.init(
      res,
      true,
      msg,
      {}
    );

  } catch (error) {
    console.error('Error fetching template details:', error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error while processing request",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};

 


  commit_staged_changes_to_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM commit_staged_changes_to_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "commited staged changes to project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  // _______________________________________________________________________________


  run_all_validations_for_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   run_all_validations_for_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "run_all_validations_for_project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  get_project_review_data = async (req, res) => {
    try {

      const { p_project_id, p_scope_name } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_review_data($1,$2)',
        values: [p_project_id, p_scope_name]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_review_data successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  submit_project_for_approval = async (req, res) => {
    try {

      const { p_project_id, p_project_user_ids } = req.body

      const query = {
        text: 'SELECT * FROM   submit_project_for_approval($1,$2)',
        values: [p_project_id, p_project_user_ids]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "submit_project_for_approval successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  get_approval_status_for_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_approval_status_for_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_approval_status_for_project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };


  upload_document_for_activity = async (req, res) => {
    try {

      const { p_project_id, p_user_id, p_activity_id, p_file_name, p_file_url, p_file_size } = req.body

      const query = {
        text: 'SELECT * FROM   upload_document_for_activity($1,$2,$3,$4,$5,$6)',
        values: [p_project_id, p_user_id, p_activity_id, p_file_name, p_file_url, p_file_size]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "upload_document_for_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_members_for_approval = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_members_for_approval($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_members_for_approval  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_overall_completion = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_project_overall_completion($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_overall_completion successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  search_auditors_to_add_to_project = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from search_auditors_to_add_to_project($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  synchronize_project_approver = async (req, res) => {
    try {

      const { p_project_id, p_role_name, p_new_approver_ids } = req.body

      const query = {
        text: 'Select * from synchronize_project_approver($1,$2,$3)',
        values: [p_project_id, p_role_name, p_new_approver_ids]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  get_project_monthly_summary = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from get_project_monthly_summary($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "template copy successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  create_new_project_request_with_file = async (req, res) => {
    try {

      const { p_creator_id, p_project_id, p_assignee_id, p_request_type, p_title, p_description, p_file_name, p_file_url, p_file_size } = req.body;

      let fileURL = null;

      console.log("req.files?.p_file_url ->", req.files?.p_file_url)
      let fileName = req.files?.p_file_url[0].originalname;

      if (req.files?.p_file_url?.length > 0) {
        const uploadRes = await cloudinary.uploader.upload(req.files.p_file_url[0].path, { resource_type: "raw" });
        fileURL = uploadRes.secure_url;
      }

      const query = {
        text: 'Select * from create_new_project_request_with_file($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        values: [p_creator_id, p_project_id, p_assignee_id, p_request_type, p_title, p_description, fileName, fileURL, 15]
      };

      console.log(query.values);

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "create_new_project_request_with_file successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_project_total_emissions_summary = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'Select * from get_project_total_emissions_summary($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_total_emissions_summary successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_available_users_for_project_team = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM   get_available_users_for_project_team($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_available_users_for_project_team successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_data_collection_sheet_for_scope = async (req, res) => {
    try {

      const { p_project_id, p_scope_name, p_page_size, p_page_number } = req.body

      const query = {
        text: 'SELECT * FROM   get_data_collection_sheet_for_scope($1,$2,$3,$4)',
        values: [p_project_id, p_scope_name, p_page_size, p_page_number]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_data_collection_sheet_for_scope successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  upsert_activity_data_batch = async (req, res) => {
    try {

      const { p_project_id, p_user_id, p_data_batch } = req.body

      const query = {
        text: 'SELECT * FROM   upsert_activity_data_batch($1,$2,$3)',
        values: [p_project_id, p_user_id, p_data_batch]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        " commit_staged_changes_to_project successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };










  create_custom_template_from_scratch = async (req, res) => {
    try {

      const { p_creator_user_id, p_template_name, p_description, p_industry, p_template_payload } = req.body

      const query = {
        text: 'SELECT * FROM  create_custom_template_from_scratch($1,$2,$3,$4,$5)',
        values: [p_creator_user_id, p_template_name, p_description, p_industry, p_template_payload]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "save_project_activity_configuration  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }





  update_project_member_permission = async (req, res) => {
    try {

      const { p_project_id, p_member_user_id, p_new_permission_level } = req.body

      const query = {
        text: 'SELECT * FROM  update_project_member_permission($1,$2,$3)',
        values: [p_project_id, p_member_user_id, p_new_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "update project member permission  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  add_new_member_to_project = async (req, res) => {
    try {

      const { p_project_id, p_user_id, p_role_name, p_permission_level } = req.body

      const query = {
        text: 'Select * from add_new_member_to_project($1,$2,$3,$4)',
        values: [p_project_id, p_user_id, p_role_name, p_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully added new member to project",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }




  update_project_member_permission = async (req, res) => {
    try {

      const { p_project_id, p_member_user_id, p_new_permission_level } = req.body

      const query = {
        text: 'Select * from update_project_member_permission($1,$2,$3)',
        values: [p_project_id, p_member_user_id, p_new_permission_level]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully updated project member permission",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }




  remove_member_from_project = async (req, res) => {
    try {

      const { p_project_id, p_user_id } = req.body

      const query = {
        text: 'Select * from remove_member_from_project($1,$2)',
        values: [p_project_id, p_user_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "successfully removed member from project",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  // get_data_collection_sheet_for_scope = async (req, res) => {
  //   try {

  //     const { p_project_id, p_scope_name, p_page_size, p_page_number } = req.body

  //     const query = {
  //       text: 'SELECT * FROM get_data_collection_sheet_for_scope($1,$2,$3,$4)',
  //       values: [p_project_id, p_scope_name, p_page_size, p_page_number]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "save_project_activity_configuration  successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // }





  getUnitById = async (req, res) => {
    try {

      const { unit_id } = req.body

      const query = {
        text: 'SELECT * FROM units WHERE unit_id = $1',
        values: [unit_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Unit fetch successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  }






  remove_project_auditor = async (req, res) => {
  try {
    const { p_project_id, p_auditor_id, p_requester_id } = req.body;

    const query = {
      text: 'SELECT * FROM remove_project_auditor($1,$2,$3)',
      values: [p_project_id, p_auditor_id, p_requester_id]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(res, false, "No response from database", {
        error: "DATABASE_ERROR"
      }, 500);
    }

    const row = result.rows[0];

    // ❌ DB returned error → mark unsuccessful
    if (row.remove_project_auditor && row.remove_project_auditor.includes("Error")) {
      return this.utility.response.init(
        res,
        false,
        row.remove_project_auditor,
        {
          templates: result.rows
        },
        400 // or something appropriate
      );
    }

    // ✅ Success → mark successful
    return this.utility.response.init(
      res,
      true,
      "remove_project_auditor successfully",
      {
        templates: result.rows,
        count: result.rows.length
      }
    );

  } catch (error) {
    console.error('Error fetching templates:', error);
    return this.utility.response.init(
      res,
      false,
      "Internal server error while fetching templates",
      {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      },
      500
    );
  }
};





  // remove_project_auditor = async (req, res) => {
  //   try {

  //     const { p_project_id, p_auditor_id, p_requester_id } = req.body

  //     const query = {
  //       text: 'SELECT * FROM remove_project_auditor($1,$2,$3)',
  //       values: [p_project_id, p_auditor_id, p_requester_id]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "remove_project_auditor successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };




  recalculate_project_status = async (req, res) => {
    try {

      const { p_project_id } = req.body

      const query = {
        text: 'SELECT * FROM recalculate_project_status($1)',
        values: [p_project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "recalculate_project_status successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  getAllProjectsByOrgID = async (req, res) => {
    try {

      const { org_id } = req.body

      const query = {
        text: 'SELECT * FROM projects WHERE org_id = $1',
        values: [org_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  getUserInfoByUserID = async (req, res) => {
    try {

      const { user_id } = req.body

      const query = {
        text: 'SELECT u.full_name,  u.email,  u.phone_number,  o.org_name,  f.facility_name,  u.facility_id FROM users u LEFT JOIN organisation o ON u.org_id = o.org_id LEFT JOIN facilities f ON u.facility_id = f.facility_id WHERE u.user_id = $1',
        values: [user_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  getAllProjectsByFacilityID = async (req, res) => {
    try {

      const { project_id } = req.body

      const query = {
        text: 'SELECT * FROM projects WHERE project_id = $1',
        values: [project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_category_totals = async (req, res) => {
    try {

      const { project_id } = req.body

      const query = {
        text: 'SELECT * FROM get_project_category_totals($1)',
        values: [project_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_details_by_org = async (req, res) => {
    try {

      const { org_id } = req.body

      const query = {
        text: 'SELECT p.*, f.facility_name, o.org_name FROM projects p LEFT JOIN facilities f ON p.facility_id = f.facility_id LEFT JOIN organisation o ON p.org_id = o.org_id WHERE p.org_id = $1;',
        values: [org_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "Fetching Projects successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_project_portfolio_list = async (req, res) => {
    try {

      const { p_user_id, p_view_type } = req.body

      const query = {
        text: 'SELECT  * FROM get_project_portfolio_list($1,$2);',
        values: [p_user_id, p_view_type]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };





  // get_project_portfolio_stats  = async (req, res) => {
  //   try {

  //     const { p_user_id } = req.body

  //     const query = {
  //       text: 'SELECT  * FROM get_project_portfolio_stats($1);',
  //       values: [p_user_id]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "get_project_portfolio_list successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



  get_task_header = async (req, res) => {
    try {

      const { p_task_id } = req.body

      const query = {
        text: 'SELECT  * FROM get_task_header($1);',
        values: [p_task_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };




  get_assigned_tasks_for_user = async (req, res) => {
    try {

      const { p_user_id, p_status_filter } = req.body

      const query = {
        text: 'SELECT  * FROM get_assigned_tasks_for_user($1,$2);',
        values: [p_user_id, p_status_filter]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_project_portfolio_list successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };






  get_task_conversation = async (req, res) => {
    try {

      const { p_task_id } = req.body

      const query = {
        text: 'SELECT * FROM get_task_conversation($1);',
        values: [p_task_id]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_task_conversation successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  add_task_comment = async (req, res) => {
    try {

      const { p_task_id, p_user_id, p_comment_text, p_file_name, p_file_url, p_file_size } = req.body

      const query = {
        text: 'SELECT  * FROM add_task_comment ($1,$2,$3,$4,$5,$6);',
        values: [p_task_id, p_user_id, p_comment_text, p_file_name, p_file_url, p_file_size]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "comment added  successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };








  

  // get_user_project_requests = async (req, res) => {
  //   try {

  //     const {  p_user_id , p_status_filter  } = req.body

  //     const query = {
  //       text: 'Select * from get_user_project_requests($1,$2)',
  //       values: [ p_user_id, p_status_filter]
  //     };

  //     const result = await this.utility.sql.query(query);

  //     if (!result.rows) {
  //       return this.utility.response.init(res, false, "No response from database", {
  //         error: "DATABASE_ERROR"
  //       }, 500);
  //     }

  //     return this.utility.response.init(
  //       res,
  //       true,
  //       "get_user_project_requests successfully",
  //       {
  //         templates: result.rows,
  //         count: result.rows.length
  //       }
  //     );

  //   } catch (error) {
  //     console.error('Error fetching templates:', error);
  //     return this.utility.response.init(
  //       res,
  //       false,
  //       "Internal server error while fetching templates",
  //       {
  //         error: "INTERNAL_SERVER_ERROR",
  //         details: error.message
  //       },
  //       500
  //     );
  //   }
  // };



get_user_project_requests = async (req, res) => {
  try {
    const { p_user_id, p_status_filter } = req.body;

    const query = {
      text: 'SELECT * FROM get_user_project_requests($1,$2)',
      values: [p_user_id, p_status_filter]
    };

    const result = await this.utility.sql.query(query);

    if (!result.rows || result.rows.length === 0) {
      return this.utility.response.init(res, true, "No records found", {
        summary: {},
        requests: []
      });
    }

    const summaryFields = [
      'total_related_requests',
      'total_team_requests',
      'total_user_requests',
      'total_open_requests',
      'total_closed_requests'
    ];

    // Extract summary from first row
    const summary = {};
    summaryFields.forEach(key => {
      summary[key] = result.rows[0][key];
    });

    // Generate cleaned request list
    const requests = result.rows.map(row => {
      const cleaned = { ...row };
      summaryFields.forEach(key => delete cleaned[key]);
      return cleaned;
    });

    return this.utility.response.init(res, true, "Fetched successfully", {
      summary,
      requests,
      count: requests.length
    });

  } catch (error) {
    console.error("Error fetching project requests:", error);
    return this.utility.response.init(res, false, "Internal server error", {
      error: "INTERNAL_SERVER_ERROR",
      details: error.message
    }, 500);
  }
};


  

  get_all_facilities_for_parent_org_of_user = async (req, res) => {
    try {

      const {  p_user_id   } = req.body

      const query = {
        text: 'Select * from get_all_facilities_for_parent_org_of_user($1)',
        values: [ p_user_id ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "get_all_facilities_for_parent_org_of_user successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };



  

  record_approver_decision = async (req, res) => {
    try {

      const {  p_project_id,p_approver_id_user_id , p_decision, p_remarks  } = req.body

      const query = {
        text: 'Select * from record_approver_decision($1,$2,$3,$4)',
        values: [ p_project_id,p_approver_id_user_id , p_decision, p_remarks ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "record_approver_decision successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  
  

  delete_staged_activity = async (req, res) => {
    try {

      const {  p_project_id , p_subcategory_id  } = req.body

      const query = {
        text: 'Select * from delete_staged_activity($1,$2)',
        values: [ p_project_id, p_subcategory_id ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "delete_staged_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  
  
  

  update_staged_activity = async (req, res) => {
    try {

      const {  p_project_id , p_old_subcategory_id, p_new_subcategory_id, p_new_frequency  } = req.body

      const query = {
        text: 'Select * from update_staged_activity($1,$2,$3,$4)',
        values: [ p_project_id , p_old_subcategory_id, p_new_subcategory_id, p_new_frequency ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "update_staged_activity successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };

  

  getUnits = async (req, res) => {
    try {

      const query = {
        text: 'SELECT unit_name,unit_id FROM units',
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      return this.utility.response.init(
        res,
        true,
        "record_approver_decision successfully",
        {
          templates: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.utility.response.init(
        res,
        false,
        "Internal server error while fetching templates",
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        },
        500
      );
    }
  };














  

  CreateProject = async (req, res) => {
    try {
      const {
        facility_id,
        project_name,
        project_description,
        reporting_period_start,
        reporting_period_end,
        responsible_party,
        intended_user,
        intended_use_of_inventory,
        organisational_boundary_type,
        reporting_protocol,
        base_year,
        team_member_ids
      } = req.body;

      // const creator_user_id = req.user.userId; // From JWT token
      const creator_user_id = 15; // From JWT token

      // Call the PostgreSQL function
      const query = {
        text: 'SELECT * FROM create_project($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,$15,$16,$17,$18,$19,$20,$21)',
        values: [
          creator_user_id,
          facility_id,
          project_name,
          project_description,
          reporting_period_start,
          reporting_period_end,
          responsible_party,
          intended_user,
          intended_use_of_inventory,
          organisational_boundary_type,
          reporting_protocol,
          base_year,
          team_member_ids || null,



          req.body.recalculation,       // $14
          req.body.changes,             // $15
          req.body.methodologies,       // $16
          req.body.references,          // $17
          req.body.sources,             // $18
          req.body.risks,               // $19
          req.body.assurance,           // $20
          req.body.inventory            // $21
        ]
      };

      const result = await this.utility.sql.query(query);

      if (!result.rows || result.rows.length === 0) {
        return this.utility.response.init(res, false, "No response from database", {
          error: "DATABASE_ERROR"
        }, 500);
      }

      const { new_project_id, status_message } = result.rows[0];

      if (new_project_id) {
        return this.utility.response.init(res, true, status_message, {
          project_id: new_project_id,
          project_name,
          facility_id,
          creator_user_id,
          team_members_added: team_member_ids ? team_member_ids.length : 0,
          reporting_period: {
            start: reporting_period_start,
            end: reporting_period_end
          }
        }, 201);
      } else {
        // Handle database errors (overlapping projects, etc.)
        return this.utility.response.init(res, false, status_message, {
          error: "PROJECT_CREATION_FAILED"
        }, 400);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      return this.utility.response.init(res, false, "Internal server error while creating project", {
        error: "INTERNAL_SERVER_ERROR",
        details: error.message
      }, 500);
    }
  };


}

module.exports = Templates;