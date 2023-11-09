const sql = require("../config/db.js");

// constructor
const Reviews = function (data) {
  this.content = data.content;
  this.image = data.image;
  this.rating = data.rating;
  this.status = data.status;
  this.room_id = data.room_id;
  this.customer_id = data.customer_id;
  this.createdAt = data.createdAt;
  this.updatedAt = data.updatedAt;
};

Reviews.checkReview = (data, result) => {
  // First, check if the associated order meets the criteria
  sql.query(
    `SELECT COUNT(*) AS cnt
    FROM orders
    RIGHT JOIN order_detail od ON orders.id = od.order_id
    RIGHT JOIN room r ON od.room_id = r.id
    WHERE customer_id = ? AND room_id = ? AND orders.status = 2`,
    [data.customer_id, data.room_id],
    (err, orderData) => {
      if (err) {
        return result(
          {
            status: 500,
            message: `Error checking order status: ${err}`,
          },
          null
        );
      }

      if (orderData.length === 0) {
        return result(
          {
            status: 400,
            message: "Order not found.",
          },
          null
        );
      } else {
        return result(null, {
          status: 200,
          message: "You are authorized to review this order.",
        });
      }
    }
  );
};

Reviews.createReview = (newReview, result) => {
  // If the order meets both criteria, proceed with creating the review
  // Your database insertion logic goes here
  sql.query(
    "SELECT id FROM reviews WHERE customer_id = ? AND room_id = ?",
    [newReview.customer_id, newReview.room_id],
    (err, existingReviews) => {
      if (err) {
        return result(
          {
            status: 500,
            message: `Error checking existing reviews: ${err}`,
          },
          null
        );
      }

      if (existingReviews.length > 0) {
        return result(
          {
            status: 403,
            message: "You have already reviewed this room.",
          },
          null
        );
      }

      sql.query(
        "INSERT INTO reviews (content, image, rating, status, room_id, customer_id, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
        [
          newReview.content,
          newReview.image,
          newReview.rating,
          newReview.status,
          newReview.room_id,
          newReview.customer_id,
          new Date(),
          new Date(),
        ],
        (err, res) => {
          if (err) {
            return result(
              {
                status: 500,
                message: `Error creating review: ${err}`,
              },
              null
            );
          }

          // Review created successfully, now calculate and update room rating
          sql.query(
            "UPDATE room AS r SET r.rating = (SELECT AVG(rv.rating) FROM reviews AS rv WHERE rv.room_id = r.id) WHERE r.id = ?",
            [newReview.room_id],
            (err) => {
              if (err) {
                return result(
                  {
                    status: 500,
                    message: `Error updating room rating: ${err}`,
                  },
                  null
                );
              }

              // Rating updated successfully
              return result(null, { id: res.insertId, ...newReview });
            }
          );
        }
      );
    }
  );
};

Reviews.getAll = (room_id, result) => {
  let query = `SELECT cus.fullname, cus.phonenumber, cus.email, reviews.content, reviews.image, reviews.rating, reviews.status, reviews.createdAt FROM reviews
  INNER JOIN customer cus ON cus.id = reviews.customer_id
WHERE status = 1 AND room_id = ?`;

  sql.query(query, room_id, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Reviews.updateById = (id, review, result) => {
  sql.query(
    "UPDATE reviews SET content = ?, image = ?, rating =? WHERE id = ?",
    [review.content, review.image, review.rating, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found review with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated review: ", { id: id, ...review });
      result(null, { id: id, ...review });
    }
  );
};

Reviews.remove = (id, result) => {
  sql.query("DELETE FROM reviews WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // not found review with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted reviews with id: ", id);
    result(null, res);
  });
};

module.exports = Reviews;
