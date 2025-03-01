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
var mongoDbName string = "fs_app_db"
var mongoCollectionFlight string = "flights"

// Database variables
var mongoclient *mongo.Client
var flightCollection *mongo.Collection

// Model Flight for Collection "flights"
type Flight struct {
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

	flightCollection = mongoclient.Database(mongoDbName).Collection(mongoCollectionFlight)
	fmt.Println("Connected to MongoDB!")
}

// POST /flights
func createFlight(c *gin.Context) {
	var jbodyFlight Flight

	// Bind JSON body to jbodyFlight
	if err := c.BindJSON(&jbodyFlight); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Insert flight into MongoDB
	result, err := flightCollection.InsertOne(ctx, jbodyFlight)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flight"})
		return
	}

	// Extract the inserted ID
	flightId, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse inserted ID"})
		return
	}
	jbodyFlight.ID = flightId

	// Read the created flight from MongoDB
	var createdFlight Flight
	err = flightCollection.FindOne(ctx, bson.M{"_id": jbodyFlight.ID}).Decode(&createdFlight)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch created flight"})
		return
	}

	// Return created flight
	c.JSON(http.StatusCreated, gin.H{
		"message": "Flight created successfully",
		"flight":  createdFlight,
	})
}

// GET /flights
func readAllFlights(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := flightCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch flights"})
		return
	}
	defer cursor.Close(ctx)

	var flights []Flight
	if err := cursor.All(ctx, &flights); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse flights"})
		return
	}

	c.JSON(http.StatusOK, flights)
}

// GET /flights/:id
func readFlightById(c *gin.Context) {
	id := c.Param("id")

	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var flight Flight
	err = flightCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&flight)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	c.JSON(http.StatusOK, flight)
}

// PUT /flights/:id
func updateFlight(c *gin.Context) {
	id := c.Param("id")
	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	var jbodyFlight Flight

	if err := c.BindJSON(&jbodyFlight); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var oldFlight Flight

	err = flightCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&oldFlight)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}
	oldFlight.Number = jbodyFlight.Number
	oldFlight.Model = jbodyFlight.Model
	oldFlight.Type = jbodyFlight.Type

	result, err := flightCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": oldFlight})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update flight"})
		return
	}

	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}
	// Return updated flight
	c.JSON(http.StatusOK, gin.H{
		"message": "Flight updated successfully",
		"flight":  oldFlight,
	})
}

// DELETE /flights/:id
func deleteFlight(c *gin.Context) {
	id := c.Param("id")
	// Convert string ID to primitive.ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, errDelete := flightCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if errDelete != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete flight"})
		return
	}

	if result.DeletedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Flight deleted successfully"})
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
	r.POST("/flights", createFlight)
	r.GET("/flights", readAllFlights)
	r.GET("/flights/:id", readFlightById)
	r.PUT("/flights/:id", updateFlight)
	r.DELETE("/flights/:id", deleteFlight)

	// Start server
	r.Run(":8080")
}
