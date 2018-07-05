const express = require('express')
const { createServer } = require('http')
const next = require('next')
const wildcardSubdomains = require('wildcard-subdomains')
// const routes = require('./routes')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const urls = require('./routes.json')

const transformApiRoutes = (routes) => {
    return routes.routeList.reduce((obj,curr,index) => {
      const seoUri = curr.seoUri.replace(/\/$/, '');
        obj[seoUri] = {
            channelCode: curr.channelCode,
            localCode: curr.localCode,
            type: curr.type,
            resortCode: curr.resortCode,
            domain: curr.domain,
            realUri: curr.realUri,
            actionType: curr.actionType,
            key: curr.key
        }
        return obj;
    },{});
};

const routesMap = transformApiRoutes(urls)
console.log('routesMap :', routesMap);

const getComponentFromUrl = (url) => {
  const dico = routesMap[url.replace(/\/$/, '')]
  if(!dico) return null;
  switch (dico.type) {
    case 'him':
      return {cmp: '/him', key: dico.key, type: dico.type}

    default:
      return {cmp: '/brand', key: dico.key, type: dico.type }
  }
}


const http = require("http");


const getContent =  (key,type,locale) => {
    const post_data = JSON.stringify({
        type,
        key,
        locale
    });

    // An object of options to indicate where to post to
    const post_options = {
        protocol: "http:",
        host: "gt-api-sandbox.louvrehotels.com",
        path: "/contents",
        method: "POST",
        port: "80",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(post_data)
        },
    };

    const post_req = http.request(post_options, (res) => {
        let response = '';
        res.setEncoding('utf8');
        res.on("data", (chunk) => {
            response += chunk;
            console.log("Response >>> : ",response);

        });
        res.on('error', (err) => {
            console.log('err >>',err);
        });
        res.on('end', () => {
            console.log('response finale  >>',response);
        });
    });

    // post the data
    post_req.write(post_data);
    post_req.end();
};

app.prepare()
  .then(() => {
    const server = express()

    server.use(wildcardSubdomains({
      namespace: 'himsub',
      whitelist: ['www'],
    }))

    server.get(`/_next*`, (req, res) => {
      return handle(req, res)
    })

    server.get(`/himsub/:resortCode`, (req, res) => {
      console.log('resortCode :', req.params.resortCode);
      console.log('URL:', req.url);
      return app.render(req, res, 'sub' , {resortCode: req.params.resortCode, query:req.query})
    })

    server.get(`/him/:lang/:category/:subcategory/:title`, (req, res) => {
      return handle(req, res)
    })

    server.get(`/him/:lang/:category/:title`, (req, res) => {
      return handle(req, res)
    })

    server.get(`/him/:lang/:title`, (req, res) => {
      return app.render(req, res, '/him', req.query)
    })

    server.get(`/:lang/:category/:subcategory/:title`, (req, res) => {
      return handle(req, res)
    })

    server.get(`/:lang/:category/:title`, (req, res) => {
      return handle(req, res)
    })
    server.get(`/:lang/:title`, (req, res) => {
      const obj = getComponentFromUrl(req.url)
      console.log('obj:', obj);
      if(!obj) return handle(req, res)
      const item = getContent(obj.type, obj.key, req.params.lang);

      return app.render(req, res, obj.cmp, {lang: req.params.lang, title:req.params.title, query:req.query})
    })

    // server.get('/posts/:id', (req, res) => {
    //   return app.render(req, res, '/posts', { id: req.params.id })
    // })

    server.get('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
