﻿//http://127.0.0.1:8081/testServer?path=tests/xml2json/xml2json.jsvar modulesFolder = FileSystemSync('Modules');var opc = require(modulesFolder.path + 'opc');var path = getFolder().path + 'Documents/sample.docx'//document type for given extension (docx, xlsx or pptx)//opc.documentTypeForExtension('docx');//opc.documentTypeForExtension('xlsx');//opc.documentTypeForExtension('pptx');if(false){//list the document extensions and their types in this document (array of MIME types)opc.extensionMap(path);//list of resource types in this document (array of MIME types)opc.resourceTypeList(path);//list of relation types in this document (array of XML namespaces)opc.relationTypeList(path);//list of external resource types in this document (array of MIME types)opc.externalResourceTypeList(path);//type of this document (MIME string)opc.documentType(path);//add a new resource type; pass the extension and MIME //if the extension is already reagistered, returns false opc.addResourceType(path, 'svg', 'image/svg-xml');//list of external resources (paths and types) for a given resource (=root if omitted)opc.externalResourceList(path);//list of resources (paths and types) for a given resource (=root if omitted) opc.resourceList(path);opc.resourceList(path, '/word/document.xml');//list of relations (paths and types) for a given resource (=root if omitted) opc.relationList(path);opc.relationList(path, '/word/document.xml');//resource type for given alias (use it to create a relation)opc.relationType('image');opc.relationType('styles');opc.relationType('styles-with-effects');opc.relationType('settings');opc.relationType('web-settings');opc.relationType('font-table');opc.relationType('theme');}//replace the image with a new one, without altering document.xmlvar imagePath = getFolder().path + 'Documents/wakanda.png';var imageData = File(imagePath).toBuffer();opc.setResource(path, 'word/media/image1.png', 'image/png', imageData);	//get the image related to the word documentopc.getResourceSize(path, 'word/media/image1.png');//returns bufferopc.getResource(path, 'word/media/image1.png');//var imageType = opc.relationType('image');//var relationId = opc.getNewRelationId(opc.relationList(path, '/word/document.xml'));//opc.createRelation(path, 'word/document.xml', 'word/media/image1.png', imageType, relationId);//false if the resource doesn't exist//opc.deleteResource(path, 'word/media/image1.png');//get the word document content (xml)opc.getResourceSize(path, '/word/document.xml');var xml = opc.getResource(path, '/word/document.xml').toString();//it's up to you to modify the xml!!!var xml2json = require(modulesFolder.path + "xml2json");xml2json.parse(xml)