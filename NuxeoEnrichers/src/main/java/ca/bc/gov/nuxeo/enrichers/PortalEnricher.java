package ca.bc.gov.nuxeo.enrichers;

import static org.nuxeo.ecm.core.io.registry.reflect.Instantiations.SINGLETON;
import static org.nuxeo.ecm.core.io.registry.reflect.Priorities.REFERENCE;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentNotFoundException;
import org.nuxeo.ecm.core.api.IdRef;
import org.nuxeo.ecm.core.io.marshallers.json.enrichers.AbstractJsonEnricher;
import org.nuxeo.ecm.core.io.registry.reflect.Setup;

import ca.bc.gov.nuxeo.utils.EnricherUtils;

@Setup(mode = SINGLETON, priority = REFERENCE)
public class PortalEnricher extends AbstractJsonEnricher<DocumentModel> {

	public static final String NAME = "portal";

    private static final Log log = LogFactory.getLog(PortalEnricher.class);
	
	public PortalEnricher() {
		super(NAME);
	}

	// Method that will be called when the enricher is asked for
	@Override
	public void write(JsonGenerator jg, DocumentModel doc) throws IOException {
		// We use the Jackson library to generate Json
		ObjectNode portalJsonObject = constructPortalJSON(doc);
		jg.writeFieldName(NAME);
		jg.writeObject(portalJsonObject);
	}

	private ObjectNode constructPortalJSON(DocumentModel doc) {
		ObjectMapper mapper = new ObjectMapper();

		// JSON object to be returned
		ObjectNode jsonObj = mapper.createObjectNode();

		// First create the parent document's Json object content
		CoreSession session = doc.getCoreSession();

		String documentType = (String) doc.getType();

		/*
		 * Properties for FVPortal
		 */
		if (documentType.equalsIgnoreCase("FVPortal")) {
			
			// Process "fv-portal:featured_words" values
			String[] featuredWordsIds = (String[]) doc.getProperty("fv-portal", "featured_words");
			if (featuredWordsIds != null) {
				ArrayNode featuredWordJsonArray = mapper.createArrayNode();
				for (String featuredWordId : featuredWordsIds) {
					IdRef ref = new IdRef(featuredWordId);
					DocumentModel featuredWordDoc = null;
					// Try to retrieve Nuxeo document. If it isn't found, continue to next iteration.

					try {
						featuredWordDoc = session.getDocument(ref);
					} catch (DocumentNotFoundException de) {
						continue;
					}
					
					ObjectNode featuredWordJsonObj = mapper.createObjectNode();
					featuredWordJsonObj.put("uid", featuredWordId);
					featuredWordJsonObj.put("dc:title", featuredWordDoc.getTitle());
					featuredWordJsonObj.put("path", featuredWordDoc.getPathAsString());
					
					// Process "fv:literal translation" values
					Object literalTranslationObj = featuredWordDoc.getProperty("fvcore", "literal_translation");
					List<Object> literalTranslationList = (ArrayList<Object>) literalTranslationObj;
					ArrayNode literalTranslationJsonArray = mapper.createArrayNode();
					for(Object literalTranslationListItem : literalTranslationList) {
						Map<String, Object> complexValue = (HashMap<String, Object>) literalTranslationListItem;
						String language = (String) complexValue.get("language");
						String translation = (String) complexValue.get("translation");
						
						// Create JSON node and add it to the array
						ObjectNode literalTranslationJsonObj = mapper.createObjectNode();
						literalTranslationJsonObj.put("language", language);
						literalTranslationJsonObj.put("translation", translation);	
						literalTranslationJsonArray.add(literalTranslationJsonObj);
					}
					featuredWordJsonObj.put("fv:literal_translation", literalTranslationJsonArray);
					
					// Process "fv-word:part_of_speech" value
					String partOfSpeechId = (String) featuredWordDoc.getProperty("fv-word",	"part_of_speech");
					String partOfSpeechLabel = EnricherUtils.getPartOfSpeechLabel(partOfSpeechId);
					featuredWordJsonObj.put("fv-word:part_of_speech", partOfSpeechLabel);
					
					// Process "fv:related_audio" values
					String[] relatedAudioIds = (String[]) featuredWordDoc.getPropertyValue("fv:related_audio");
					ArrayNode relatedAudioJsonArray = mapper.createArrayNode();
					
					// Retrieve additional properties from the referenced binaries, and add them to the JSON
					for(String relatedAudioId : relatedAudioIds) {
						ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(relatedAudioId, session);
						if(binaryJsonObj != null) {
							relatedAudioJsonArray.add(binaryJsonObj);
						}
					}
					featuredWordJsonObj.put("fv:related_audio", relatedAudioJsonArray);
										
					featuredWordJsonArray.add(featuredWordJsonObj);
				}
				jsonObj.put("fv-portal:featured_words", featuredWordJsonArray);
			}
			
			// Process "fv-portal:featured_audio" values
			String[] featuredAudioIds = (String[]) doc.getProperty("fv-portal", "featured_audio");
			if (featuredAudioIds != null) {
				ArrayNode featuredAudioJsonArray = mapper.createArrayNode();		
				
				// Retrieve additional properties from the referenced binaries, and add them to the JSON
				for (String featuredAudioId : featuredAudioIds) {
					ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(featuredAudioId, session);
					if(binaryJsonObj != null) {
						featuredAudioJsonArray.add(binaryJsonObj);
					}
				}
				jsonObj.put("fv-portal:featured_audio", featuredAudioJsonArray);
			}
			
			// Process "fv-portal:background_top_image" value
			String backgroundTopImageId = (String) doc.getProperty("fv-portal", "background_top_image");
			if (backgroundTopImageId != null) {				
				// Retrieve additional properties from the referenced binaries, and add them to the JSON
				ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(backgroundTopImageId, session);
				if(binaryJsonObj != null) {
					jsonObj.put("fv-portal:background_top_image", binaryJsonObj);
				}
			}			

			// Process "fv-portal:background_bottom_image" value
			String backgroundBottomImageId = (String) doc.getProperty("fv-portal", "background_bottom_image");
			if (backgroundBottomImageId != null) {				
				// Retrieve additional properties from the referenced binaries, and add them to the JSON
				ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(backgroundBottomImageId, session);
				if(binaryJsonObj != null) {
					jsonObj.put("fv-portal:background_bottom_image", binaryJsonObj);
				}
			}				
			
			// Process "fv-portal:related_links" values
			String[] relatedLinkIds = (String[]) doc.getProperty("fv-portal", "related_links");
			if (relatedLinkIds != null) {
				ArrayNode relatedLinkJsonArray = mapper.createArrayNode();
				for (String relatedId : relatedLinkIds) {
					ObjectNode relatedLinkJsonObj = EnricherUtils.getLinkJsonObject(relatedId, session);
					if(relatedLinkJsonObj != null) {
						relatedLinkJsonArray.add(relatedLinkJsonObj);
					}
				}
				jsonObj.put("fv-portal:related_links", relatedLinkJsonArray);
			}
		}

		return jsonObj;
	}
}