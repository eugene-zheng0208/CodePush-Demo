import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import codePush from 'react-native-code-push'

class App extends React.Component {
  state = {
    updateInfo: '',
  }

  componentDidMount() {
    const codePushPromise = new Promise((resolve) => {
      this.checkUpdate(resolve)
    })

    const timerPromise = new Promise((resolve) => {
      this.timer = setTimeout(() => {
        resolve()
      }, 3000)
    })

    Promise.all([codePushPromise, timerPromise]).then(() => {
      console.log('navigate')
    }).catch((err) => {console.warn(err)})
  }

  componentWillUnmount() {
    clearTimeout(this.updateTimer)
    clearTimeout(this.timer)
  }

  codePushStatusDidChange(status) {
    switch(status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        this.setState({
          updateInfo: "Checking for updates."
        });
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({
          updateInfo: "Downloading package."
        });
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({
          updateInfo: "Installing update."
        });
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        this.setState({
          updateInfo: "Up-to-date."
        });
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        this.setState({
          updateInfo: "Update installed."
        });
        break;
    }
  }

  codePushDownloadDidProgress(progress) {
    this.setState({
      updateInfo: progress.receivedBytes + " of " + progress.totalBytes + " received."
    });
  }

  checkUpdate = (resolve) => {
    let doUpdate = true
    let checkReturn = false
    this.updateTimer = setTimeout(() => {
      if (!checkReturn) {
        doUpdate = false
        resolve('updateTimer end')
      }
    }, 5000)
    codePush.checkForUpdate().then((update) => {
      checkReturn = true
      if (doUpdate) {
        if (!update) {
          this.setState({updateInfo: "Up-to-date."}, () => {resolve()})
        } else {
          codePush.sync(
            {installMode: codePush.InstallMode.IMMEDIATE},
            this.codePushStatusDidChange,
            this.codePushDownloadDidProgress
          ).then(() => {
            resolve()
          }).catch(() => {
            resolve()
          })
        }
      } else {
        resolve()
      }
    }).catch(() => {
      resolve()
    })
    codePush.notifyAppReady()
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
        <Text style={styles.updateText}>{this.state.updateInfo}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    textAlign:'center',
    fontSize: 14,
    color: '#666666',
    backgroundColor: 'transparent',
  },
});

export default codePush(App)
