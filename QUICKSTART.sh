#!/bin/bash

# Calendar Maps - Quick Start Script
# This script helps you set up the Calendar Maps application quickly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
  print_header "Checking Prerequisites"

  # Check Node.js
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
  fi
  NODE_VERSION=$(node -v)
  print_success "Node.js $NODE_VERSION"

  # Check npm
  if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
  fi
  NPM_VERSION=$(npm -v)
  print_success "npm $NPM_VERSION"

  # Check git
  if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
  fi
  GIT_VERSION=$(git -v)
  print_success "Git installed"
}

# Install dependencies
install_dependencies() {
  print_header "Installing Dependencies"

  if [ -d "node_modules" ]; then
    print_warning "node_modules already exists"
    read -p "Reinstall dependencies? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      rm -rf node_modules package-lock.json
    else
      print_info "Skipping dependency installation"
      return
    fi
  fi

  echo "Installing npm packages..."
  npm install
  print_success "Dependencies installed"
}

# Setup environment
setup_environment() {
  print_header "Setting Up Environment"

  if [ -f ".env.local" ]; then
    print_warning ".env.local already exists"
    read -p "Overwrite? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cp .env.example .env.local
    else
      print_info "Using existing .env.local"
      return
    fi
  else
    cp .env.example .env.local
    print_success ".env.local created"
  fi

  # Prompt for configuration
  print_info "Please configure your Google Cloud credentials"
  echo
  echo "Step 1: Go to https://console.cloud.google.com/"
  echo "Step 2: Create a new project or select existing"
  echo "Step 3: Enable these APIs:"
  echo "  - Google Calendar API"
  echo "  - Google Maps API"
  echo "  - Geocoding API"
  echo "Step 4: Create OAuth 2.0 credentials (Web application)"
  echo "Step 5: Add redirect URL: http://localhost:3000/api/auth/callback/google"
  echo
  
  read -p "Enter your GOOGLE_CLIENT_ID: " CLIENT_ID
  read -p "Enter your GOOGLE_CLIENT_SECRET: " CLIENT_SECRET
  read -p "Enter your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: " MAPS_KEY

  # Update .env.local
  sed -i "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env.local
  sed -i "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env.local
  sed -i "s/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.*/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$MAPS_KEY/" .env.local
  sed -i "s/GOOGLE_MAPS_API_KEY=.*/GOOGLE_MAPS_API_KEY=$MAPS_KEY/" .env.local

  print_success "Environment configured"
}

# Build application
build_app() {
  print_header "Building Application"

  echo "Building Next.js application..."
  npm run build
  print_success "Build complete"
}

# Start development server
start_dev_server() {
  print_header "Starting Development Server"

  print_info "Development server will start on http://localhost:3000"
  echo
  print_warning "Press Ctrl+C to stop the server"
  echo

  sleep 2
  npm run dev
}

# Show next steps
show_next_steps() {
  print_header "Next Steps"

  echo "1. The development server is running"
  echo "2. Open http://localhost:3000 in your browser"
  echo "3. Click 'Connect Calendar' to authenticate with Google"
  echo "4. Navigate to /dashboard to see your calendar events on a map"
  echo
  echo "For more information, see:"
  echo "  - README.md - Feature overview"
  echo "  - SETUP.md - Detailed setup guide"
  echo "  - API.md - API documentation"
  echo "  - DEPLOYMENT.md - Deployment guide"
}

# Main menu
show_menu() {
  echo
  print_header "Calendar Maps - Quick Start"
  echo "1. Full Setup (recommended first-time)"
  echo "2. Install Dependencies Only"
  echo "3. Setup Environment Only"
  echo "4. Start Development Server"
  echo "5. Build for Production"
  echo "6. View Documentation"
  echo "0. Exit"
  echo
  read -p "Select option (0-6): " option
}

# View documentation
view_documentation() {
  echo
  echo "Available documentation:"
  echo "1. README.md - Overview and features"
  echo "2. SETUP.md - Detailed setup guide"
  echo "3. API.md - API documentation"
  echo "4. DEPLOYMENT.md - Deployment options"
  echo "5. TESTING.md - Testing guide"
  echo "0. Back to main menu"
  echo
  read -p "Select document (0-5): " doc_choice

  case $doc_choice in
    1) less README.md ;;
    2) less SETUP.md ;;
    3) less API.md ;;
    4) less DEPLOYMENT.md ;;
    5) less TESTING.md ;;
    0) return ;;
    *) print_error "Invalid option" ;;
  esac
}

# Main loop
main() {
  clear
  
  print_header "Calendar Maps Setup"
  echo "Welcome to Calendar Maps!"
  echo "This script will help you set up the application."
  echo

  # Check prerequisites
  check_prerequisites

  while true; do
    show_menu

    case $option in
      1)
        check_prerequisites
        install_dependencies
        setup_environment
        build_app
        read -p "Start development server now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          start_dev_server
        else
          show_next_steps
        fi
        ;;
      2)
        install_dependencies
        ;;
      3)
        setup_environment
        ;;
      4)
        start_dev_server
        ;;
      5)
        build_app
        print_info "Built files are in .next/ directory"
        print_info "To start production server: npm start"
        ;;
      6)
        view_documentation
        ;;
      0)
        print_info "Goodbye!"
        exit 0
        ;;
      *)
        print_error "Invalid option"
        ;;
    esac
  done
}

# Run main function
main
