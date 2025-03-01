package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Config
var mongoUri string = "mongodb://localhost:27017"
var mongoDbName string = "ps_app_db"
var mongoCollectionPizza string = "pizzas"

// Database variables
var mongoclient *mongo.Client
var pizzaCollection *mongo.Collection

// Model Pizza for Collection "pizzas"
type Pizza struct {
	ID     primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Number string             `json:"number" bson:"number"`
	Model  string             `json:"model" bson:"model"`
	Type   string             `json:"type" bson:"type"`
}

// Connect to MongoDB
func connectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var errrorConnection error
	mongoclient, errrorConnection = mongo.Connect(ctx, options.Client().ApplyURI(mongoUri))
	if errrorConnection != nil {
		log.Fatal("MongoDB Connection Error:", errrorConnection)
	}

	pizzaCollection = mongoclient.Database(mongoDbName).Collection(mongoCollectionPizza)
	fmt.Println("Connected to MongoDB!")
}

// POST /pizzas
func createPizza(c *gin.Context) {
	var jbodyPizza Pizza

	// Bind JSON body to jbodyPizza
	if err := c.BindJSON(&jbodyPizza); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Insert pizza into MongoDB
	result, err := pizzaCollection.InsertOne(ctx, jbodyPizza)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pizza"})
		return
	}

	// Extract the inserted ID
	pizzaId, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse inserted ID"})
		return
	}
	jbodyPizza.ID = pizzaId

	// Read the created pizza from MongoDB
	var createdPizza Pizza
	err = pizzaCollection.FindOne(ctx, bson.M{"_id": jbodyPizza.ID}).Decode(&createdPizza)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created pizza"})
		return
	}

	// Return created pizza
	c.JSON(http.StatusCreated, gin.H{
		"message": "Pizza created successfully",
		"pizza":   createdPizza,
	})
}

// GET /pizzas
func readAllPizzas(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := pizzaCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pizzas"})
		return
	}
	defer cursor.Close(ctx)

	var pizzas []Pizza
	if err := cursor.All(ctx, &pizzas); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse pizzas"})
		return
	}

	c.JSON(http.StatusOK, pizzas)
}

// GET /pizzas/:id
func readPizzaById(c *gin.Context) {
	id := c.Param("id")

	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var pizza Pizza
	err = pizzaCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&pizza)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pizza not found"})
		return
	}

	c.JSON(http.StatusOK, pizza)
}

// PUT /pizzas/:id
func updatePizza(c *gin.Context) {
	id := c.Param("id")
	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	var jbodyPizza Pizza

	if err := c.BindJSON(&jbodyPizza); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var oldPizza Pizza

	err = pizzaCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&oldPizza)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pizza not found"})
		return
	}
	oldPizza.Number = jbodyPizza.Number
	oldPizza.Model = jbodyPizza.Model
	oldPizza.Type = jbodyPizza.Type

	result, err := pizzaCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": oldPizza})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pizza"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pizza not found"})
		return
	}
	// Return updated pizza
	c.JSON(http.StatusOK, gin.H{
		"message": "Pizza updated successfully",
		"pizza":   oldPizza,
	})
}

// DELETE /pizzas/:id
func deletePizza(c *gin.Context) {
	id := c.Param("id")
	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, errDelete := pizzaCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if errDelete != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pizza"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pizza not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pizza deleted successfully"})
}

func main() {
	// Connect to MongoDB
	connectDB()

	// Set up Gin router
	r := gin.Default()
	// CORS Configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"}, // React frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	// Routes
	r.POST("/pizzas", createPizza)
	r.GET("/pizzas", readAllPizzas)
	r.GET("/pizzas/:id", readPizzaById)
	r.PUT("/pizzas/:id", updatePizza)
	r.DELETE("/pizzas/:id", deletePizza)

	// Start server
	r.Run(":8080")
}
