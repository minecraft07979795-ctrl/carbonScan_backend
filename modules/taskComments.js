class TaskComments {
  constructor(_utility) {
    this.utility = _utility;
  }

  AddCommentToTask = async (req, res) => {
    try {
      const { taskId, commenterId, commentText } = req.body;

      if (
        taskId === undefined ||
        commenterId === undefined ||
        commentText === undefined
      ) {
        return this.utility.response.init(
          res,
          false,
          "taskId, commenterId, and commentText are required"
        );
      }

      const p_task_id = Number(taskId);
      const p_commenter_id = Number(commenterId);
      const p_comment_text = String(commentText).trim();

      if (!Number.isInteger(p_task_id) || p_task_id <= 0) {
        return this.utility.response.init(
          res,
          false,
          "taskId must be a positive integer"
        );
      }
      if (!Number.isInteger(p_commenter_id) || p_commenter_id <= 0) {
        return this.utility.response.init(
          res,
          false,
          "commenterId must be a positive integer"
        );
      }
      if (!p_comment_text) {
        return this.utility.response.init(
          res,
          false,
          "commentText must be a non-empty string"
        );
      }

      const query = {
        text: "SELECT public.add_comment_to_request($1, $2, $3) AS new_comment_id",
        values: [p_task_id, p_commenter_id, p_comment_text],
      };

      const result = await this.utility.sql.query(query);
      const row = result?.rows?.[0];
      const new_comment_id = row?.new_comment_id ? Number(row.new_comment_id) : null;

      if (new_comment_id === null) {
        return this.utility.response.init(
          res,
          false,
          "Failed to add comment. Invalid taskId or commenterId."
        );
      }

      if (new_comment_id > 0) {
        // Successful insertion
        return this.utility.response.init(
          res,
          true,
          "Comment added successfully.",
          { new_comment_id }
        );
      }

      // Edge case (shouldn't happen normally)
      return this.utility.response.init(
        res,
        false,
        "Failed to add comment due to an unknown reason."
      );

    } catch (err) {
      const message = err?.message || "An unexpected error occurred.";
      console.error("AddCommentToTask error:", err);
      return this.utility.response.init(res, false, "Comment creation failed", {
        error: message,
      });
    }
  };

  GetRequestThreadDetails = async (req, res) => {
    try {
      const { task_id } = req.query;

      const query = {
        text: 'SELECT * FROM get_request_thread_details($1)',
        values: [task_id]
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
        "Request thread details retrieved successfully",
        {
          comments: result.rows,
          count: result.rows.length
        }
      );

    } catch (error) {
      console.error('Error fetching request thread details:', error);
      return this.utility.response.init(
        res, 
        false, 
        "Internal server error while fetching request thread details", 
        {
          error: "INTERNAL_SERVER_ERROR",
          details: error.message
        }, 
        500
      );
    }
  };
}

module.exports = TaskComments;
