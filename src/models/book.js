module.exports = (sequelize, DataTypes) => {
    const Book = sequelize.define("Book", {
        title: {
            type: DataTypes.STRING
        },
        author: {
            type: DataTypes.STRING
        },
        genre_id: {
            type: DataTypes.INTEGER
        },
        quantity: {
            type: DataTypes.INTEGER
        },
        cover_image: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Books'
    });

    Book.associate = (models) => {
        Book.belongsTo(models.Genre, {
            foreignKey: 'genre_id',
            as: 'Genre'
        });
    };

    return Book;
}; 