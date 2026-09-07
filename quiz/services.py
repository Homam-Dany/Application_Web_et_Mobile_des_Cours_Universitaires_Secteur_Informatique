from content.models import Concept, ConceptPrerequisite
import networkx as nx

def build_concept_graph():
    """
    Construit un graphe orienté (DAG) des concepts et de leurs prérequis 
    en utilisant la bibliothèque NetworkX.
    """
    G = nx.DiGraph()
    concepts = Concept.objects.all()
    for concept in concepts:
        G.add_node(concept.id, name=concept.name)
        
    prerequisites = ConceptPrerequisite.objects.all()
    for prereq in prerequisites:
        # L'arête va du prérequis vers le concept (A est nécessaire pour B : A -> B)
        G.add_edge(prereq.prerequisite.id, prereq.concept.id)
        
    return G

def get_missing_prerequisites(failed_concept_ids):
    """
    Étant donné une liste de concepts échoués (par ex, issus de questions ratées),
    retourne la liste de tous les concepts prérequis (ancêtres dans le graphe)
    qu'il faut potentiellement réviser.
    """
    G = build_concept_graph()
    missing_prereqs = set()
    
    for concept_id in failed_concept_ids:
        if concept_id in G:
            # Récupérer tous les ancêtres (prérequis directs et indirects)
            ancestors = nx.ancestors(G, concept_id)
            missing_prereqs.update(ancestors)
            
    # Retourner les objets Concept correspondants
    return Concept.objects.filter(id__in=missing_prereqs)
