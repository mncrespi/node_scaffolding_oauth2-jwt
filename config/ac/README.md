# Generate Authorization certificate

### Example:

```
$ openssl genrsa -out priv.pem 2048
$ openssl rsa -in priv.pem -pubout -out pub.pem
```