var express = require("express");
var app = express();
var axios = require("axios");
var morgan = require("morgan");
var _ = require("lodash");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

var secretOrPrivateKey = "hex";
var uplink = "https://registry.npmjs.org/";
var tgzlink = "http://localhost.charlesproxy.com:4873";

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(function(req, res, next) {
  if (req.headers.authorization) {
    var userInfo = jwt.decode(req.headers.authorization.split(" ")[1]);
    if (!_.isNull(userInfo)) {
      req.username = userInfo.name;
    }
  }
  next();
});

app.get("/:scope/:name", function(req, res, next) {
  const { scope, name } = req.params;
  if (scope.indexOf("@") === -1) {
    next();
    return;
  }
  axios(uplink + scope + "/" + name)
    .then(function(response) {
      var data = response.data;
      _.forEach(data.versions, function(item) {
        item.dist.tarball = `${tgzlink}/${item.name}/-/${name}-${item.version}.tgz`;
      });
      res.json(data);
    })
    .catch(function(error) {
      if ("status" in error.response) {
        res.status(error.response.status).send(error.response.data);
      }
    });
});

app.get("/:scope/:name/:version", function(req, res, next) {
  const { scope, name, version } = req.params;
  if (name === "-") {
    next();
    return;
  }
  axios(uplink + scope + "/" + name)
    .then(function(response) {
      var data = response.data;
      if (version in data.versions) {
        var result = data.versions[version];
        result.dist.tarball = `${tgzlink}/${result.name}/-/${name}-${version}.tgz`;
        res.json(result);
      } else {
        res.status(404).json({
          error: `this version doesn't exist: ${version}`
        });
      }
    })
    .catch(function(error) {
      if ("status" in error.response) {
        res.status(error.response.status).send(error.response.data);
      }
    });
});

app.get("/:name", function(req, res, next) {
  const { name } = req.params;
  if (name.indexOf("/") !== -1) {
    res.redirect(`/${name.split("/")[0]}/${name.split("/")[1]}/`);
    return;
  }

  axios(uplink + name)
    .then(function(response) {
      var data = response.data;
      _.forEach(data.versions, function(item) {
        item.dist.tarball = `${tgzlink}/${item.name}/-/${item.name}-${item.version}.tgz`;
      });
      res.json(data);
    })
    .catch(function(error) {
      if ("status" in error.response) {
        res.status(error.response.status).send(error.response.data);
      }
    });
});

app.get("/:name/:version", function(req, res, next) {
  const { name, version } = req.params;
  axios(uplink + name + "/" + version)
    .then(function(response) {
      var data = response.data;
      data.dist.tarball = `${tgzlink}/${name}/-/${name}-${version}.tgz`;
      res.json(data);
    })
    .catch(function(error) {
      console.log(error.response);
      if ("status" in error.response) {
        res.status(error.response.status).send(error.response.data);
      }
    });
});

// TODO: download tarball
app.get("/:scope/:name/-/:tgzname.tgz", function(req, res, next) {
  res.json({
    method: req.method,
    path: req.path,
    param: req.params,
    headers: req.headers,
    body: req.body,
    handle: "/:scope/:name/-/tgzname.tgz"
  });
});

// TODO: download tarball
app.get("/:name/-/:tgzname.tgz", function(req, res, next) {
  res.json({
    method: req.method,
    path: req.path,
    param: req.params,
    headers: req.headers,
    body: req.body,
    handle: "/:name/-/:tgzname.tgz"
  });
});

app.post("/-/npm/v1/security/audits/quick", function(req, res, next) {
  axios
    .post(uplink + "-/npm/v1/security/audits/quick", {
      data: req.body,
      headers: req.headers
    })
    .then(function(response) {
      res.json(response.data);
    })
    .catch(function(error) {
      if ("status" in error.response) {
        res.status(error.response.status).send(error.response.data);
      }
    });
});

app.get("/-/ping", function(req, res, next) {
  res.status(200).json({});
});

app.put("/-/user/:user", function(req, res, next) {
  if (req.body.name === "admin" && req.body.password === "admin") {
    res.status(201).json({ token: jwt.sign(req.body, secretOrPrivateKey) });
  } else {
    res.status(401).end("");
  }
});

app.post("/-/v1/login", function(req, res, next) {
  res.status(404).end();
});

app.all("*", function(req, res, next) {
  // TODO: 404 other
  // res.status(404).end()
  res.json({
    method: req.method,
    path: req.path,
    param: req.params,
    headers: req.headers,
    body: req.body
  });
});

app.listen(3000);
