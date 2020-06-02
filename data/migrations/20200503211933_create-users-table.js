exports.up = function(knex) {
  return knex.schema.createTable("users", tbl => {
    tbl.increments()
    tbl.text("username")
      .unique()
      .notNullable()
    tbl.text("password")
      .notNullable()
    // Optional fields
    tbl.text("department")
    tbl.text("first_name")
    tbl.text("last_name")
    tbl.text("email")
    tbl.text("address")
    tbl.text("birthday") // Use the ISO8601 string format
    tbl.text("profile_img_url")
    tbl.text("bio")
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("users")
};