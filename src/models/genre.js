module.exports = (sequelize, DataTypes) => {
    const Genre = sequelize.define("Genre", {
        name: {
            type: DataTypes.STRING
        }
    }, {
        tableName: 'Genres'
    });

    Genre.associate = (models) => {
        Genre.hasMany(models.Book, {
            foreignKey: 'genre_id',
            as: 'Books'
        });
    };

    return Genre;
}; 