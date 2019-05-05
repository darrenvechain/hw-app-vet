# thor-ledger

[TOC]

#### isSupported

```
let isSupported = await Transport.isSupported()
console.log('isSupported', isSupported)

isSupported true
```



#### getAppConfiguration

```
let appConfiguration = await thorLedger.getAppConfiguration()
console.log("AppConfiguration", appConfiguration.toString('hex'))

AppConfiguration 03010003
```



#### getAccount

```
let account = await thorLedger.getAccount(path)
console.log('account', account)

account 
{publicKey:'043cff5201bdf9668d4526f5217a3205d425db794593a416275b9560907c912452c3416d7f8a65940fc0f449acdba6945c81c9449ec2e8c0fdbc32c4fce9480306',
address: '0xb12DEb5611E374dF55BC517d4b1e3f142466aB14' 
}
```



#### signTransaction

```
let txSig = await thorLedger.signTransaction(path, Buffer.from(rawTx, 'hex'))
console.log('sig tx', txSig.toString('hex'))

sig tx 5f7e8eedce7667a313ff3391cae24fc44d1260e196fee5aef7421cc46e598fb86c9ad52d2f15817c013e23549b9c377616ff2c9ff8bb3a5e7fa0dc575cced58101
```



#### signMessage

```
let message = Buffer.from('ca9a93009b4617a7e9385d834b931899805baa4bd396f57c9ec35d750efd733e', 'hex')
let msgSig = await thorLedger.signMessage(path, message)
console.log('sig msg', msgSig.toString('hex'))

sig msg 0e0e4f931ea1cc3d29482823c837e11dab1ae355252af4269315cb47e34efd6c2a0950b64555b1e69f499e07b22a20524d1c63567e6298e2f163722e620c863001
```



#### signJSON

```
let jsonSig = await thorLedger.signJSON(path, Buffer.from(encodedJSON, 'utf-8'))
console.log('sig json', "0x" + jsonSig.toString('hex'))

sig json 0x26a17db2554ef362923b5ea81c1b697bc133cfe124c47d0b4c83e8853a2c6eca3e6e2b1cc34bf00c277501d8ecbca70bbe3e5233998ed0398ee6f7e6924d98d100
```

