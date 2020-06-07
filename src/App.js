import React, { Component } from 'react'
import './App.css'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'


const particleOptions = {
particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 200
      }
    }
  }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    console.log('data only', data)
    console.log('data name', data.name)
    this.setState ({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  calculateFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width - (face.right_col * width),
      bottomRow: height - (face.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
      console.log(box)
      this.setState({ box: box})
  }

  onButtonSubmit = () => {
    console.log(this.state.user.id)
    this.setState({ imageUrl: this.state.input});
    fetch('https://kentlogic-smart-brain-api.herokuapp.com/imageUrl', {
              method: 'post',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({
                input: this.state.input
          })
        })
    .then(response => response.json())
    .then(response => {
      if (response) {
          fetch('https://kentlogic-smart-brain-api.herokuapp.com/image', {
              method: 'put',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({
                id: this.state.user.id
          })
        }).then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    
    })
    .catch(err => console.log(err));
}

  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({ input: event.target.value});
  }

  onRouteChange = (route) => { 
    if (route === 'home') {
      this.setState({ isSignedIn: true })
    } else if (route === 'signout') {
        this.setState(initialState)
    }
    this.setState ({route: route })
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles
        className='particles'
          params={particleOptions} 
        />
        <Navigation isSignedIn = {isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home' ?
            <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <ImageLinkForm onInputChange = {this.onInputChange}
                            onButtonSubmit = {this.onButtonSubmit} />
              <FaceRecognition box = {box} imageUrl = {imageUrl} />
            </div>
            : (
              this.state.route === 'signin' ?
                <Signin loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
                :
                <Register loadUser = {this.loadUser} onRouteChange={this.onRouteChange}/>
              )
      }
      </div>
    );
  }
}

export default App;
