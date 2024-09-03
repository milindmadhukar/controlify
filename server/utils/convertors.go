package utils

import "fmt"

func PixelDataToHex(pixelData []byte) []string {
	// NOTE: Only converting for rgb as of now, maybe other formats also need to be considered
	var hexData []string
	for i := 0; i < len(pixelData); i += 3 {
		hexData = append(hexData, fmt.Sprintf("%02x%02x%02x", pixelData[i], pixelData[i+1], pixelData[i+2]))
	}
	return hexData
}
