package ca.bc.gov.nuxeo.enrichers;

import static org.nuxeo.ecm.core.io.registry.reflect.Instantiations.SINGLETON;
import static org.nuxeo.ecm.core.io.registry.reflect.Priorities.REFERENCE;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.JsonGenerationException;
import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.JsonMappingException;
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
public class WordEnricher extends AbstractJsonEnricher<DocumentModel> {

	public static final String NAME = "word";

	public WordEnricher() {
		super(NAME);
	}

	// Method that will be called when the enricher is asked for
	@Override
	public void write(JsonGenerator jg, DocumentModel doc) throws IOException {
		// We use the Jackson library to generate Json
		ObjectNode wordJsonObject = constructWordJSON(doc);
		jg.writeFieldName(NAME);
		jg.writeObject(wordJsonObject);
	}

	private ObjectNode constructWordJSON(DocumentModel doc) throws JsonGenerationException, JsonMappingException, IOException {
		ObjectMapper mapper = new ObjectMapper();

		// JSON object to be returned
		ObjectNode jsonObj = mapper.createObjectNode();

		// First create the parent document's Json object content
		CoreSession session = doc.getCoreSession();

		String documentType = doc.getType();

		/*
		 * Properties for FVWord
		 */
		if (documentType.equalsIgnoreCase("FVWord")) {

			// Process "fv-word:categories" values
			String[] categoryIds = (String[]) doc.getProperty("fv-word", "categories");
			ArrayNode categoryArray = mapper.createArrayNode();
			for (String categoryId : categoryIds) {
				ObjectNode categoryObj = EnricherUtils.getDocumentIdAndTitleJsonObject(categoryId, session);
				if(categoryObj != null) {
					categoryArray.add(categoryObj);
				}
			}
			jsonObj.put("categories", categoryArray);

			// Process "fv-word:part_of_speech" value
			String partOfSpeechId = (String) doc.getProperty("fv-word",	"part_of_speech");
			String partOfSpeechLabel = EnricherUtils.getPartOfSpeechLabel(partOfSpeechId);
			jsonObj.put("part_of_speech", partOfSpeechLabel);

			// Process "fvcore:source" values
			String[] sourceIds = (String[]) doc.getProperty("fvcore", "source");
			if (sourceIds != null) {
				ArrayNode sourceArray = mapper.createArrayNode();
				for (String sourceId : sourceIds) {
					ObjectNode sourceObj = EnricherUtils.getDocumentIdAndTitleJsonObject(sourceId, session);
					if(sourceObj != null) {
						sourceArray.add(sourceObj);
					}	
				}
				jsonObj.put("sources", sourceArray);
			}

			// Process "fv-word:related_phrases" values
			String[] phraseIds = (String[]) doc.getProperty("fv-word", "related_phrases");
			if (phraseIds != null) {
				ArrayNode phraseArray = mapper.createArrayNode();
				for (String phraseId : phraseIds) {
					IdRef ref = new IdRef(phraseId);
					DocumentModel phraseDoc = null;
					// Try to retrieve Nuxeo document. If it isn't found, continue to next iteration.
					try {
						phraseDoc = session.getDocument(ref);
					} catch (DocumentNotFoundException de) {
						continue;
					}

					ObjectNode phraseObj = mapper.createObjectNode();
					phraseObj.put("uid", phraseId);
					phraseObj.put("path", phraseDoc.getPath().toString());
												
					// Construct JSON array node for fv:definitions
					ArrayList<Object> definitionsList = (ArrayList<Object>)phraseDoc.getProperty("fvcore", "definitions");									
					ArrayNode definitionsJsonArray = mapper.createArrayNode();
					for(Object definition : definitionsList) {
						Map<String, Object> complexValue = (HashMap<String, Object>) definition;
						String language = (String) complexValue.get("language");
						String translation = (String) complexValue.get("translation");
						
						// Create JSON node and add it to the array
						ObjectNode jsonNode = mapper.createObjectNode();
						jsonNode.put("language", language);
						jsonNode.put("translation", translation);	
						definitionsJsonArray.add(jsonNode);
					}
					phraseObj.put("fv:definitions", definitionsJsonArray);					
					
					// Construct JSON array node for fv:literal_translation
					ArrayList<Object> literalTranslationList = (ArrayList<Object>)phraseDoc.getProperty("fvcore", "literal_translation");									
					ArrayNode literalTranslationJsonArray = mapper.createArrayNode();
					for(Object literalTranslation : literalTranslationList) {
						Map<String, Object> complexValue = (HashMap<String, Object>) literalTranslation;
						String language = (String) complexValue.get("language");
						String translation = (String) complexValue.get("translation");
						
						// Create JSON node and add it to the array
						ObjectNode jsonNode = mapper.createObjectNode();
						jsonNode.put("language", language);
						jsonNode.put("translation", translation);	
						literalTranslationJsonArray.add(jsonNode);
					}
					phraseObj.put("fv:literal_translation", literalTranslationJsonArray);
										
					phraseObj.put("dc:title", phraseDoc.getTitle());
					phraseArray.add(phraseObj);
				}
				jsonObj.put("related_phrases", phraseArray);
			}

			// Process "fv:related_audio" values
			String[] audioIds = (String[]) doc.getProperty("fvcore", "related_audio");
			if (audioIds != null) {
				ArrayNode audioJsonArray = mapper.createArrayNode();
				for (String audioId : audioIds) {
					ObjectNode binaryJsonObj = EnricherUtils.getBinaryPropertiesJsonObject(audioId, session);
					if(binaryJsonObj != null) {
						audioJsonArray.add(binaryJsonObj);
					}
				}
				jsonObj.put("related_audio", audioJsonArray);
			}
		}

		return jsonObj;
	}
}